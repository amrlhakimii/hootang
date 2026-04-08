export function TopHeader() {
  return (
    <header
      className="sticky top-0 z-30 px-5 py-3 flex items-center justify-between"
      style={{
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
      <span className="text-[10px] text-[#EEEEEE]/25 tracking-widest uppercase hidden sm:block">
        Track · Split · Settle
      </span>
    </header>
  )
}
