import { useState } from 'react'
import { PageContainer } from '../../components/ui/pageContainer'
import { Navbar } from '../../components/ui/navbar'
import { DiceRoller } from './diceRoller'
import { RandomPicker } from './randomPicker'

export function DicePage() {
  const [names, setNames] = useState<string[]>([])

  const addName = (name: string) => setNames((prev) => [...prev, name])
  const removeName = (name: string) => setNames((prev) => prev.filter((n) => n !== name))

  return (
    <PageContainer>
      <Navbar title="Dice Roller" />
      <p className="text-[#EEEEEE]/30 text-sm -mt-4 mb-6">No debates, just fate. Let the dice decide.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dice */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(145deg, rgba(0,173,181,0.1) 0%, rgba(57,62,70,0.5) 100%)', border: '1px solid rgba(0,173,181,0.15)' }}>
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #00ADB5, transparent)' }} />
          <div className="p-5">
            <p className="text-[#EEEEEE]/40 text-[11px] font-semibold uppercase tracking-widest mb-1">Who pays?</p>
            <DiceRoller names={names} />
          </div>
        </div>

        {/* Picker */}
        <div className="rounded-2xl" style={{ background: 'rgba(57,62,70,0.5)', border: '1px solid rgba(238,238,238,0.06)' }}>
          <div className="p-5">
            <p className="text-[#EEEEEE]/40 text-[11px] font-semibold uppercase tracking-widest mb-4">Players in the pool</p>
            <RandomPicker names={names} onAdd={addName} onRemove={removeName} />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
