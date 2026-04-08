import { useDice } from '../../hooks/useDice'
import { Button } from '../../components/layout/button'

const diceFaces: Record<number, string> = { 1: '⚀', 2: '⚁', 3: '⚂', 4: '⚃', 5: '⚄', 6: '⚅' }

interface DiceRollerProps {
  names: string[]
}

export function DiceRoller({ names }: DiceRollerProps) {
  const { rolling, result, diceValue, roll } = useDice(names)

  return (
    <div className="flex flex-col items-center gap-5 py-6">
      {/* Dice */}
      <div
        className={`text-8xl select-none transition-all duration-100 ${rolling ? 'scale-110' : 'scale-100'}`}
        style={{ filter: diceValue ? 'drop-shadow(0 0 24px #00ADB5)' : 'none' }}
      >
        {diceValue ? diceFaces[diceValue] : '🎲'}
      </div>

      {/* Result */}
      {result && !rolling && (
        <div className="text-center px-6 py-4 rounded-2xl w-full" style={{ background: 'rgba(0,173,181,0.1)', border: '1px solid rgba(0,173,181,0.2)' }}>
          <p className="text-[#EEEEEE]/40 text-xs uppercase tracking-widest mb-1">The universe decided</p>
          <p style={{ fontFamily: "'Syne', sans-serif" }} className="text-[#00ADB5] text-3xl font-extrabold">{result}</p>
          <p className="text-[#EEEEEE]/30 text-sm mt-1">pays the bill 💸</p>
        </div>
      )}

      {!result && !rolling && names.length > 0 && (
        <p className="text-[#EEEEEE]/25 text-sm">{names.length} player{names.length > 1 ? 's' : ''} in the pool</p>
      )}

      {names.length === 0 && (
        <p className="text-[#EEEEEE]/25 text-sm text-center">Add names on the right to get started</p>
      )}

      <Button onClick={roll} disabled={rolling || names.length === 0} size="lg" className="w-full max-w-48">
        {rolling ? '🎲 Rolling...' : '🎲 Roll!'}
      </Button>
    </div>
  )
}
