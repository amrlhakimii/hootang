import { useEffect, useRef } from 'react'
import { Flame } from 'lucide-react'
import anime from 'animejs'

interface DailySpendingCardProps {
  today: number
  week: number
  month: number
}

export function DailySpendingCard({ today, week, month }: DailySpendingCardProps) {
  const todayRef = useRef<HTMLParagraphElement>(null)
  const weekRef = useRef<HTMLParagraphElement>(null)
  const monthRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const fmt = (v: number) => `RM ${v.toFixed(2)}`

    const counter = { today: 0, week: 0, month: 0 }
    anime({
      targets: counter,
      today,
      week,
      month,
      duration: 900,
      easing: 'easeOutExpo',
      update() {
        if (todayRef.current) todayRef.current.textContent = fmt(counter.today)
        if (weekRef.current) weekRef.current.textContent = fmt(counter.week)
        if (monthRef.current) monthRef.current.textContent = fmt(counter.month)
      },
    })
  }, [today, week, month])

  return (
    <div
      className="rounded-3xl p-6 md:p-8 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #00ADB5 0%, #007a80 45%, #1a2330 100%)',
        boxShadow: '0 24px 64px rgba(0,173,181,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      {/* Dot grid texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='white' fill-opacity='0.12'/%3E%3C/svg%3E")`,
          opacity: 0.6,
        }}
      />

      {/* Large decorative circle top-right */}
      <div
        className="absolute -top-20 -right-20 w-72 h-72 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 65%)' }}
      />
      {/* Small decorative circle bottom-left */}
      <div
        className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 65%)' }}
      />
      {/* Arc sweep */}
      <div
        className="absolute top-0 right-0 w-56 h-56"
        style={{
          background: 'conic-gradient(from 195deg, transparent 0deg, rgba(255,255,255,0.06) 55deg, transparent 110deg)',
          borderRadius: '50%',
          transform: 'translate(35%, -35%)',
        }}
      />

      <div className="relative">
        {/* Top row */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-white/55 text-xs font-semibold uppercase tracking-widest">Today's Spending</p>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <Flame size={11} className="text-orange-300" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-orange-300">spent</span>
          </div>
        </div>

        {/* Big number */}
        <p
          ref={todayRef}
          style={{ fontFamily: "'Syne', sans-serif" }}
          className="text-5xl md:text-6xl font-extrabold text-white leading-none tracking-tight mb-6"
        />

        {/* Week / Month row */}
        <div className="flex gap-6">
          <div>
            <p className="text-white/45 text-xs mb-0.5">This week</p>
            <p ref={weekRef} className="text-white font-bold text-lg leading-none" />
          </div>
          <div className="w-px" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <div>
            <p className="text-white/45 text-xs mb-0.5">This month</p>
            <p ref={monthRef} className="text-white font-bold text-lg leading-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
