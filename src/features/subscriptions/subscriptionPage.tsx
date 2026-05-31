import { useState, useRef, useEffect } from 'react'
import { Plus, Tv, DollarSign } from 'lucide-react'
import { gsap } from 'gsap'
import { PageContainer } from '../../components/ui/pageContainer'
import { Navbar } from '../../components/ui/navbar'
import { Button } from '../../components/layout/button'
import { Modal } from '../../components/layout/modal'
import { EmptyState } from '../../components/layout/emptyState'
import { SubscriptionCard } from './subscriptionCard'
import { SubscriptionForm } from './subscriptionForm'
import { useSubscriptions } from '../../hooks/useSubscription'
import { formatCurrency } from '../../utils/formatCurrency'

function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: `linear-gradient(145deg, ${color}18 0%, rgba(57,62,70,0.5) 100%)`, border: `1px solid ${color}25` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}20` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <p style={{ fontFamily: "'Syne', sans-serif", color }} className="text-2xl font-extrabold leading-none mb-1">{value}</p>
      <p className="text-[#EEEEEE]/40 text-xs font-medium">{label}</p>
    </div>
  )
}

export function SubscriptionPage() {
  const { subscriptions, addSubscription, deleteSubscription, togglePayment } = useSubscriptions()
  const [showModal, setShowModal] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const hasAnimatedCards = useRef(false)

  useEffect(() => {
    const cards = statsRef.current ? Array.from(statsRef.current.children) : []
    if (!cards.length) return
    gsap.fromTo(cards,
      { opacity: 0, y: 22, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.4)', stagger: 0.09 }
    )
    return () => { gsap.killTweensOf(cards); gsap.set(cards, { clearProps: 'all' }) }
  }, [])

  useEffect(() => {
    if (hasAnimatedCards.current || !cardsRef.current || subscriptions.length === 0) return
    hasAnimatedCards.current = true
    const items = Array.from(cardsRef.current.children)
    gsap.fromTo(items,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', stagger: 0.08, delay: 0.15 }
    )
  }, [subscriptions.length])

  const totalMonthly = subscriptions.filter((s) => s.billingCycle === 'monthly').reduce((sum, s) => sum + s.totalAmount, 0)

  return (
    <PageContainer>
      <Navbar title="Subscriptions" action={<Button onClick={() => setShowModal(true)}><Plus size={15} /> Add Subscription</Button>} />
      <p className="text-[#EEEEEE]/30 text-sm -mt-4 mb-6">Split your streaming costs with the crew.</p>

      <div ref={statsRef} className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Active" value={String(subscriptions.length)} color="#8b5cf6" icon={<Tv size={16} />} />
        <StatCard label="Monthly spend" value={formatCurrency(totalMonthly)} color="#00ADB5" icon={<DollarSign size={16} />} />
      </div>

      {subscriptions.length === 0 ? (
        <EmptyState icon="📺" title="No subscriptions yet" description="Split your streaming bills with friends" />
      ) : (
        <div ref={cardsRef} className="space-y-3">
          {subscriptions.map((sub) => (
            <SubscriptionCard key={sub.id} subscription={sub} onDelete={deleteSubscription} onToggle={togglePayment} />
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Subscription">
        <SubscriptionForm onSubmit={(data) => { addSubscription(data); setShowModal(false) }} onCancel={() => setShowModal(false)} />
      </Modal>
    </PageContainer>
  )
}
