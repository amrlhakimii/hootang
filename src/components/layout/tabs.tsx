interface Tab {
  id: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  active: string
  onChange: (id: string) => void
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 bg-[#222831] rounded-xl p-1 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`shrink-0 flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            active === tab.id
              ? 'bg-[#00ADB5] text-[#222831]'
              : 'text-[#EEEEEE]/50 hover:text-[#EEEEEE]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
