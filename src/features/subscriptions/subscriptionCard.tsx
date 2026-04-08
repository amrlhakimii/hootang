import { useState } from 'react'
import { ChevronDown, ChevronUp, Trash2, Users } from 'lucide-react'
import { type Subscription } from '../../types/subscription'
import { Button } from '../../components/layout/button'
import { PaymentHistory } from './paymentHistory'
import { formatCurrency } from '../../utils/formatCurrency'
import { getCostPerPerson } from '../../utils/calculateSubscription'

const serviceColors: Record<string, string> = {
  Spotify: '#1DB954',
  Netflix: '#E50914',
  'YouTube Premium': '#FF0000',
  iCloud: '#2C7BE5',
  Canva: '#7D2AE8',
  'Disney+': '#113CCF',
}

interface SubscriptionCardProps {
  subscription: Subscription
  onDelete: (id: string) => void
  onToggle: (subId: string, name: string, month: string) => void
}

export function SubscriptionCard({ subscription, onDelete, onToggle }: SubscriptionCardProps) {
  const [expanded, setExpanded] = useState(false)
  const color = serviceColors[subscription.name] || '#00ADB5'
  const perPerson = getCostPerPerson(subscription)

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(57,62,70,0.55)', border: '1px solid rgba(238,238,238,0.06)', backdropFilter: 'blur(8px)' }}
    >
      {/* Color top strip */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black text-white shrink-0"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
            >
              {subscription.name.charAt(0)}
            </div>
            <div>
              <p className="text-[#EEEEEE] font-semibold text-sm leading-none mb-1">{subscription.name}</p>
              <div className="flex items-center gap-3 text-xs text-[#EEEEEE]/40">
                <span style={{ color }}>{formatCurrency(subscription.totalAmount)}/mo</span>
                <span className="flex items-center gap-1"><Users size={10} /> {subscription.participants.length}</span>
                <span className="capitalize">{subscription.billingCycle}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right mr-1">
              <p style={{ fontFamily: "'Syne', sans-serif" }} className="text-[#EEEEEE] font-extrabold text-base leading-none">{formatCurrency(perPerson)}</p>
              <p className="text-[#EEEEEE]/30 text-[10px] mt-0.5">per person</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>
            <Button size="sm" variant="danger" onClick={() => onDelete(subscription.id)}>
              <Trash2 size={13} />
            </Button>
          </div>
        </div>

        {expanded && <PaymentHistory subscription={subscription} onToggle={onToggle} />}
      </div>
    </div>
  )
}
