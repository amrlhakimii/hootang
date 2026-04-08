import { formatCurrency } from '../../utils/formatCurrency'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface BalanceCardProps {
  owed: number
  owing: number
}

export function BalanceCard({ owed, owing }: BalanceCardProps) {
  const net = owed - owing
  const positive = net >= 0
  const total = owed + owing
  const owedPct = total > 0 ? (owed / total) * 100 : 50

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
          <p className="text-white/55 text-xs font-semibold uppercase tracking-widest">Net Balance</p>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: positive ? 'rgba(74,222,128,0.18)' : 'rgba(248,113,113,0.18)' }}
          >
            {positive
              ? <TrendingUp size={11} className="text-green-300" />
              : <TrendingDown size={11} className="text-red-300" />
            }
            <span className={`text-[10px] font-bold uppercase tracking-wide ${positive ? 'text-green-300' : 'text-red-300'}`}>
              {positive ? 'positive' : 'negative'}
            </span>
          </div>
        </div>

        {/* Big number */}
        <p
          style={{ fontFamily: "'Syne', sans-serif" }}
          className="text-5xl md:text-6xl font-extrabold text-white leading-none tracking-tight mb-6"
        >
          {positive ? '+' : ''}{formatCurrency(net)}
        </p>

        {/* Ratio bar */}
        {total > 0 && (
          <div className="mb-5">
            <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${owedPct}%`,
                  background: 'linear-gradient(90deg, #4ade80, #22c55e)',
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-green-300/60 font-medium">← owed to you</span>
              <span className="text-[10px] text-red-300/60 font-medium">you owe →</span>
            </div>
          </div>
        )}

        {/* Owed / Owing row */}
        <div className="flex gap-6">
          <div>
            <p className="text-white/45 text-xs mb-0.5">You are owed</p>
            <p className="text-white font-bold text-lg leading-none">{formatCurrency(owed)}</p>
          </div>
          <div className="w-px" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <div>
            <p className="text-white/45 text-xs mb-0.5">You owe</p>
            <p className="text-white font-bold text-lg leading-none">{formatCurrency(owing)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
