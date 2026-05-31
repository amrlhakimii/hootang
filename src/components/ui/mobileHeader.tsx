import { UserMenu } from '../../features/auth/UserMenu'

export function TopHeader() {
  return (
    <header
      className="sticky top-0 z-30 px-5 flex items-center justify-between"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
        paddingBottom: '12px',
        background: 'rgba(34, 40, 49, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(238,238,238,0.04)',
      }}
    >
      <span
        style={{ fontFamily: "'Syne', sans-serif" }}
        className="text-xl font-extrabold tracking-tight"
      >
        <span style={{ color: '#00ADB5' }}>hoo</span>
        <span className="text-[#EEEEEE]">tang</span>
      </span>

      <div className="flex items-center gap-3">
        <span className="text-[10px] text-[#EEEEEE]/25 tracking-widest uppercase hidden sm:block">
          Track · Split · Settle
        </span>
        <UserMenu />
      </div>
    </header>
  )
}
