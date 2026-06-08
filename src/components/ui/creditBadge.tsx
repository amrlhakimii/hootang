export function CreditBadge() {
  return (
    <div
      title="made by amrlhakimi"
      style={{
        width: 26,
        height: 26,
        borderRadius: '50%',
        overflow: 'hidden',
        opacity: 0.45,
        border: '1px solid rgba(0,173,181,0.35)',
        boxShadow: '0 0 8px rgba(0,173,181,0.2)',
        animation: 'coinSpin 5s linear infinite',
        cursor: 'default',
        flexShrink: 0,
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
