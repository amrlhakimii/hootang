export interface Env {
  FIREBASE_PROJECT_ID: string
  FIREBASE_CLIENT_EMAIL: string
  FIREBASE_PRIVATE_KEY: string
}

// ---- JWT / OAuth2 ----

async function getAccessToken(env: Env): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const claim = {
    iss: env.FIREBASE_CLIENT_EMAIL,
    scope: [
      'https://www.googleapis.com/auth/datastore',
      'https://www.googleapis.com/auth/firebase.messaging',
    ].join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  const b64url = (s: string) =>
    btoa(s).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = b64url(JSON.stringify(claim))
  const signingInput = `${header}.${payload}`

  const pem = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  const pemBody = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '')
  const keyBytes = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0))

  const key = await crypto.subtle.importKey(
    'pkcs8',
    keyBytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(signingInput)
  )

  const encodedSig = b64url(String.fromCharCode(...new Uint8Array(sig)))
  const jwt = `${signingInput}.${encodedSig}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })
  const data = (await res.json()) as { access_token: string }
  return data.access_token
}

// ---- Firestore REST ----

type FsValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { arrayValue: { values?: FsValue[] } }
  | { mapValue: { fields: Record<string, FsValue> } }
  | { nullValue: null }

function extractValue(v: FsValue): unknown {
  if ('stringValue' in v) return v.stringValue
  if ('integerValue' in v) return Number(v.integerValue)
  if ('doubleValue' in v) return v.doubleValue
  if ('booleanValue' in v) return v.booleanValue
  if ('nullValue' in v) return null
  if ('arrayValue' in v) return (v.arrayValue.values ?? []).map(extractValue)
  if ('mapValue' in v) {
    const obj: Record<string, unknown> = {}
    for (const [k, val] of Object.entries(v.mapValue.fields)) obj[k] = extractValue(val)
    return obj
  }
  return null
}

type DocData = Record<string, unknown> & { _id: string }

function parseDoc(doc: { name: string; fields?: Record<string, FsValue> }): DocData {
  const id = doc.name.split('/').pop()!
  const out: Record<string, unknown> = { _id: id }
  if (doc.fields) {
    for (const [k, v] of Object.entries(doc.fields)) out[k] = extractValue(v)
  }
  return out as DocData
}

async function listDocs(token: string, projectId: string, path: string): Promise<DocData[]> {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}?pageSize=300`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) return []
  const data = (await res.json()) as {
    documents?: Array<{ name: string; fields?: Record<string, FsValue> }>
  }
  return (data.documents ?? []).map(parseDoc)
}

// ---- Date helpers ----

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function getNextBillingDate(startDate: string, cycle: string): string {
  const start = new Date(startDate + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (cycle === 'monthly') {
    const c = new Date(today.getFullYear(), today.getMonth(), start.getDate())
    if (c <= today) c.setMonth(c.getMonth() + 1)
    return toDateStr(c)
  } else {
    const c = new Date(today.getFullYear(), start.getMonth(), start.getDate())
    if (c <= today) c.setFullYear(c.getFullYear() + 1)
    return toDateStr(c)
  }
}

// ---- FCM ----

async function sendPush(
  token: string,
  fcmToken: string,
  projectId: string,
  body: string
): Promise<void> {
  await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        token: fcmToken,
        notification: { title: 'hootang reminder', body },
        webpush: {
          notification: { icon: 'https://hootang.amrlhakimi.my/icon-192.png' },
        },
      },
    }),
  })
}

// ---- Main ----

async function run(env: Env): Promise<void> {
  const token = await getAccessToken(env)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const targetDate = toDateStr(addDays(today, 3))

  const users = await listDocs(token, env.FIREBASE_PROJECT_ID, 'users')

  for (const user of users) {
    const fcmTokens = (user.fcmTokens as string[] | undefined) ?? []
    if (fcmTokens.length === 0) continue

    const uid = user._id
    const [bills, loans, subs] = await Promise.all([
      listDocs(token, env.FIREBASE_PROJECT_ID, `users/${uid}/bills`),
      listDocs(token, env.FIREBASE_PROJECT_ID, `users/${uid}/loans`),
      listDocs(token, env.FIREBASE_PROJECT_ID, `users/${uid}/subscriptions`),
    ])

    const messages: string[] = []

    for (const b of bills) {
      if (b.dueDate === targetDate) {
        messages.push(`Bill "${b.name}" of RM${b.amount} is due in 3 days`)
      }
    }

    for (const l of loans) {
      if (l.status !== 'settled' && l.dueDate === targetDate) {
        const label = l.type === 'lent' ? `lent to ${l.person}` : `owed to ${l.person}`
        messages.push(`Loan RM${l.amount} (${label}) is due in 3 days`)
      }
    }

    for (const s of subs) {
      const nextDate = getNextBillingDate(s.startDate as string, s.billingCycle as string)
      if (nextDate === targetDate) {
        messages.push(`Subscription "${s.name}" of RM${s.totalAmount} renews in 3 days`)
      }
    }

    for (const body of messages) {
      for (const fcmToken of fcmTokens) {
        await sendPush(token, fcmToken, env.FIREBASE_PROJECT_ID, body)
      }
    }
  }
}

export default {
  async fetch(): Promise<Response> {
    return new Response('hootang notification worker')
  },
  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    await run(env)
  },
}
