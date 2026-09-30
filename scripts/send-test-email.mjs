import { readFileSync, existsSync } from 'node:fs'

// Load environment variables from .env if present
if (existsSync('.env')) {
  const envContent = readFileSync('.env', 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"](.*)['"]$/, '$1')
      if (!process.env[key]) {
        process.env[key] = val
      }
    }
  }
}

const SUPPORTED_ACTIONS = [
  'magiclink',
  'recovery',
  'signup',
  'invite',
  'email_change',
  'reauthentication',
]

const args = process.argv.slice(2)
const isEn = args.includes('--en')
const locale = isEn ? 'en' : 'pt'
const emailArg = args.find((arg) => arg.includes('@'))
const actionArg = args.find((arg) => SUPPORTED_ACTIONS.includes(arg) || arg === 'all')

const targetEmail =
  emailArg ||
  process.env.TEST_EMAIL ||
  'circulab@emanuelsaramago.com'

const action = actionArg || 'magiclink'
const port = process.env.PORT || '4200'
const baseUrl = `http://localhost:${port}`
const endpointUrl = `${baseUrl}/api/auth/send-email`

function generatePayload(actionType) {
  const token = Math.floor(100000 + Math.random() * 900000).toString()
  const tokenHash = `test_hash_${Math.random().toString(36).substring(2, 10)}`
  const tokenNew = Math.floor(100000 + Math.random() * 900000).toString()
  const tokenHashNew = `test_hash_new_${Math.random().toString(36).substring(2, 10)}`

  return {
    user: {
      id: '00000000-0000-0000-0000-000000000001',
      email: targetEmail,
      user_metadata: {
        language: locale,
        name: 'Utilizador Teste',
      },
    },
    email_data: {
      token,
      token_hash: tokenHash,
      token_new: tokenNew,
      token_hash_new: tokenHashNew,
      email_action_type: actionType,
      site_url: baseUrl,
      redirect_to: `${baseUrl}/auth/confirm`,
      old_email: targetEmail,
      new_email: actionType === 'email_change' ? `novo.${targetEmail}` : undefined,
    },
  }
}

async function sendTest(actionType) {
  const payload = generatePayload(actionType)
  console.log(`\n📬 Sending test email for '${actionType}'...`)
  console.log(`   Recipient: ${targetEmail}`)
  console.log(`   Language:  ${locale}`)
  if (payload.email_data.token) {
    console.log(`   OTP code:  ${payload.email_data.token}`)
  }

  const response = await fetch(endpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    console.error(`❌ Failed (${response.status}):`, data)
    return false
  }

  console.log(`✅ Success for '${actionType}':`, data)
  return true
}

async function main() {
  try {
    // Quick health check
    await fetch(endpointUrl, { method: 'OPTIONS' }).catch(() => {})

    if (action === 'all') {
      console.log(`🚀 Starting tests for ALL email actions (${SUPPORTED_ACTIONS.length} total)...`)
      let successCount = 0
      for (const act of SUPPORTED_ACTIONS) {
        const ok = await sendTest(act)
        if (ok) successCount++
        // Small delay between calls
        await new Promise((r) => setTimeout(r, 600))
      }
      console.log(`\n🎉 Completed: ${successCount}/${SUPPORTED_ACTIONS.length} actions succeeded!`)
    } else {
      const ok = await sendTest(action)
      if (!ok) process.exit(1)
    }
  } catch (error) {
    console.error(`❌ Could not connect to dev server at ${baseUrl}.`)
    console.error(`   Make sure the dev server is running (e.g. 'pnpm dev').`)
    console.error(`   Details:`, error.message)
    process.exit(1)
  }
}

main()
