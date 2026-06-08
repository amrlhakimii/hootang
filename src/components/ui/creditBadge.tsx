export function CreditBadge() {
  return (
    <div
      title="made by amrlhakimi"
      style={{
        position: 'fixed',
        bottom: 'calc(22px + env(safe-area-inset-bottom))',
        right: '14px',
        zIndex: 40,
        width: 26,
        height: 26,
        borderRadius: '50%',
        overflow: 'hidden',
        opacity: 0.35,
        border: '1px solid rgba(0,173,181,0.3)',
        boxShadow: '0 0 8px rgba(0,173,181,0.15)',
        animation: 'coinSpin 5s linear infinite',
        cursor: 'default',
      }}
    >
      <img
        src="/amrlhakimi.png"
        alt="amrlhakimi"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  )
}
