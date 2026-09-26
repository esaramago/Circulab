#!/usr/bin/env bash

# Supabase SSH Tunnel Manager
# Loads configuration from environment or .env file to avoid committing credentials/IPs to Git

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Carrega variáveis do .env se existir
if [ -f "$ROOT_DIR/.env" ]; then
  # Carrega variáveis sem exportar tudo indiscriminadamente
  eval "$(grep -E '^(SUPABASE_SSH_HOST|SUPABASE_DB_CONTAINER_IP|SUPABASE_DB_LOCAL_PORT|SUPABASE_DB_REMOTE_PORT)=' "$ROOT_DIR/.env" 2>/dev/null)"
fi

VPS_HOST="${SUPABASE_SSH_HOST}"
CONTAINER_IP="${SUPABASE_DB_CONTAINER_IP}"
LOCAL_PORT="${SUPABASE_DB_LOCAL_PORT:-5432}"
REMOTE_PORT="${SUPABASE_DB_REMOTE_PORT:-5432}"

if [ -z "$VPS_HOST" ] || [ -z "$CONTAINER_IP" ]; then
  echo "✗ Erro: SUPABASE_SSH_HOST ou SUPABASE_DB_CONTAINER_IP não estão definidos no ficheiro .env."
  echo "  Adiciona ao teu .env local:"
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
    echo "✓ Túnel Supabase já está ativo (PID: $PID) em 127.0.0.1:${LOCAL_PORT}."
    return 0
  fi

  echo "A iniciar túnel SSH para o Supabase ($CONTAINER_IP:$REMOTE_PORT via $VPS_HOST)..."
  ssh -f -N -T -o ServerAliveInterval=60 -o ExitOnForwardFailure=yes -L "${LOCAL_PORT}:${CONTAINER_IP}:${REMOTE_PORT}" "$VPS_HOST"

  sleep 1

  if is_running; then
    PID=$(pgrep -f "ssh.*${LOCAL_PORT}:${CONTAINER_IP}:${REMOTE_PORT}")
    echo "✓ Túnel iniciado com sucesso (PID: $PID)!"
    echo "  Base de dados disponível em: 127.0.0.1:${LOCAL_PORT}"
  else
    echo "✗ Erro: Não foi possível estabelecer o túnel SSH. Verifica a ligação à VPS."
    exit 1
  fi
}

stop_tunnel() {
  if is_running; then
    echo "A terminar túnel Supabase..."
    pkill -f "ssh.*${LOCAL_PORT}:${CONTAINER_IP}:${REMOTE_PORT}"
    echo "✓ Túnel terminado."
  else
    echo "Nenhum túnel ativo encontrado."
  fi
}

status_tunnel() {
  if is_running; then
    PID=$(pgrep -f "ssh.*${LOCAL_PORT}:${CONTAINER_IP}:${REMOTE_PORT}")
    echo "✓ Túnel ativo (PID: $PID) a escutar em 127.0.0.1:${LOCAL_PORT} -> $CONTAINER_IP:$REMOTE_PORT."
  else
    echo "✗ Túnel inativo."
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
    echo "Uso: $0 [start|stop|restart|status]"
    exit 1
    ;;
esac
