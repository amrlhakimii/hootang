import { onSchedule } from 'firebase-functions/v2/scheduler'
import * as admin from 'firebase-admin'

admin.initializeApp()

const db = admin.firestore()
const messaging = admin.messaging()

const NOTIFY_DAYS_BEFORE = 3

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getNextBillingDate(startDate: string, billingCycle: 'monthly' | 'yearly'): string {
  const start = new Date(startDate + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (billingCycle === 'monthly') {
    const candidate = new Date(today.getFullYear(), today.getMonth(), start.getDate())
    if (candidate <= today) candidate.setMonth(candidate.getMonth() + 1)
    return toDateString(candidate)
  } else {
    const candidate = new Date(today.getFullYear(), start.getMonth(), start.getDate())
    if (candidate <= today) candidate.setFullYear(candidate.getFullYear() + 1)
    return toDateString(candidate)
  }
}

export const checkDueDates = onSchedule(
  { schedule: 'every day 09:00', timeZone: 'Asia/Kuala_Lumpur' },
  async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const targetDate = toDateString(addDays(today, NOTIFY_DAYS_BEFORE))

    const usersSnap = await db.collection('users').get()

    for (const userDoc of usersSnap.docs) {
      const tokens: string[] = userDoc.data().fcmTokens ?? []
      if (tokens.length === 0) continue

      const uid = userDoc.id
      const notifications: string[] = []

      const [billsSnap, loansSnap, subsSnap] = await Promise.all([
        db.collection('users').doc(uid).collection('bills').get(),
        db.collection('users').doc(uid).collection('loans').get(),
        db.collection('users').doc(uid).collection('subscriptions').get(),
      ])

      for (const bill of billsSnap.docs) {
        const d = bill.data()
        if (d.dueDate === targetDate) {
          notifications.push(`Bill "${d.name}" of RM${d.amount} is due in 3 days`)
        }
      }

      for (const loan of loansSnap.docs) {
        const d = loan.data()
        if (d.status !== 'settled' && d.dueDate === targetDate) {
          const label = d.type === 'lent' ? `you lent to ${d.person}` : `you owe ${d.person}`
          notifications.push(`Loan RM${d.amount} (${label}) is due in 3 days`)
        }
      }

      for (const sub of subsSnap.docs) {
        const d = sub.data()
        const nextDate = getNextBillingDate(d.startDate, d.billingCycle)
        if (nextDate === targetDate) {
          notifications.push(`Subscription "${d.name}" of RM${d.totalAmount} renews in 3 days`)
        }
      }

      for (const body of notifications) {
        await messaging.sendEachForMulticast({
          tokens,
          notification: { title: 'hootang reminder', body },
          webpush: {
            notification: { icon: 'https://hootang.amrlhakimi.my/icon-192.png' },
          },
        })
      }
    }
  }
)
