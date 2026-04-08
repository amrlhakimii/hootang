import { useState } from 'react'

export function useDice(names: string[]) {
  const [rolling, setRolling] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [diceValue, setDiceValue] = useState<number | null>(null)

  const roll = () => {
    if (rolling || names.length === 0) return
    setRolling(true)
    setResult(null)

    let count = 0
    const interval = setInterval(() => {
      setDiceValue(Math.ceil(Math.random() * 6))
      count++
      if (count >= 12) {
        clearInterval(interval)
        const finalDice = Math.ceil(Math.random() * 6)
        setDiceValue(finalDice)
        const winner = names[Math.floor(Math.random() * names.length)]
        setResult(winner)
        setRolling(false)
      }
    }, 80)
  }

  return { rolling, result, diceValue, roll }
}
