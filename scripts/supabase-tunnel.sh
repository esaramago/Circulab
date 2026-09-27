#!/usr/bin/env bash

# Supabase SSH Tunnel Manager
# Loads configuration from environment or .env file to avoid committing credentials/IPs to Git

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Load variables from .env if it exists
if [ -f "$ROOT_DIR/.env" ]; then
  # Load variables without indiscriminately exporting everything
  eval "$(grep -E '^(SUPABASE_SSH_HOST|SUPABASE_DB_CONTAINER_IP|SUPABASE_DB_LOCAL_PORT|SUPABASE_DB_REMOTE_PORT)=' "$ROOT_DIR/.env" 2>/dev/null)"
fi

VPS_HOST="${SUPABASE_SSH_HOST}"
CONTAINER_IP="${SUPABASE_DB_CONTAINER_IP}"
LOCAL_PORT="${SUPABASE_DB_LOCAL_PORT:-5432}"
REMOTE_PORT="${SUPABASE_DB_REMOTE_PORT:-5432}"

if [ -z "$VPS_HOST" ] || [ -z "$CONTAINER_IP" ]; then
  echo "✗ Error: SUPABASE_SSH_HOST or SUPABASE_DB_CONTAINER_IP are not defined in the .env file."
  echo "  Add to your local .env:"
  echo "  SUPABASE_SSH_HOST=\"user@vps-ip\""
  echo "  SUPABASE_DB_CONTAINER_IP=\"internal-container-ip\""
  exit 1
fi

ACTION="${1:-start}"

is_running() {
  pgrep -f "ssh.*${LOCAL_PORT}:${CONTAINER_IP}:${REMOTE_PORT}" > /dev/null 2>&1
}

start_tunnel() {
  if is_running; then
    PID=$(pgrep -f "ssh.*${LOCAL_PORT}:${CONTAINER_IP}:${REMOTE_PORT}")
    echo "✓ Supabase tunnel is already active (PID: $PID) on 127.0.0.1:${LOCAL_PORT}."
    return 0
  fi

  echo "Starting SSH tunnel to Supabase ($CONTAINER_IP:$REMOTE_PORT via $VPS_HOST)..."
  ssh -f -N -T -o ServerAliveInterval=60 -o ExitOnForwardFailure=yes -L "${LOCAL_PORT}:${CONTAINER_IP}:${REMOTE_PORT}" "$VPS_HOST"

  sleep 1

  if is_running; then
    PID=$(pgrep -f "ssh.*${LOCAL_PORT}:${CONTAINER_IP}:${REMOTE_PORT}")
    echo "✓ Tunnel started successfully (PID: $PID)!"
    echo "  Database available at: 127.0.0.1:${LOCAL_PORT}"
  else
    echo "✗ Error: Could not establish SSH tunnel. Check the connection to the VPS."
    exit 1
  fi
}

stop_tunnel() {
  if is_running; then
    echo "Stopping Supabase tunnel..."
    pkill -f "ssh.*${LOCAL_PORT}:${CONTAINER_IP}:${REMOTE_PORT}"
    echo "✓ Tunnel stopped."
  else
    echo "No active tunnel found."
  fi
}

status_tunnel() {
  if is_running; then
    PID=$(pgrep -f "ssh.*${LOCAL_PORT}:${CONTAINER_IP}:${REMOTE_PORT}")
    echo "✓ Active tunnel (PID: $PID) listening on 127.0.0.1:${LOCAL_PORT} -> $CONTAINER_IP:$REMOTE_PORT."
  else
    echo "✗ Tunnel inactive."
  fi
}

case "$ACTION" in
  start)
    start_tunnel
    ;;
  stop)
    stop_tunnel
    ;;
  restart)
    stop_tunnel
    sleep 1
    start_tunnel
    ;;
  status)
    status_tunnel
    ;;
  *)
    echo "Usage: $0 [start|stop|restart|status]"
    exit 1
    ;;
esac
