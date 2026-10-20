interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  stacked?: boolean
  tagline?: string
}

const sizes = {
  sm: { icon: 28, text: 'text-lg' },
  md: { icon: 34, text: 'text-xl' },
  lg: { icon: 72, text: 'text-4xl' },
}

/** App icon + two-colour wordmark ("hoo" teal, "tang" light) in the display font. */
export function Logo({ size = 'md', stacked = false, tagline }: LogoProps) {
  const s = sizes[size]
  return (
    <div className={`flex ${stacked ? 'flex-col text-center' : ''} items-center gap-2.5`}>
      <img src="/logo.svg" alt="" width={s.icon} height={s.icon} className="shrink-0" style={{ width: s.icon, height: s.icon }} />
      <div className="leading-none">
        <span style={{ fontFamily: "'Syne', sans-serif" }} className={`${s.text} font-extrabold tracking-tight`}>
          <span style={{ color: '#00ADB5' }}>hoo</span>
          <span className="text-[#EEEEEE]">tang</span>
        </span>
        {tagline && <p className="text-xs text-[#EEEEEE]/40 mt-1.5">{tagline}</p>}
      </div>
    </div>
  )
}
