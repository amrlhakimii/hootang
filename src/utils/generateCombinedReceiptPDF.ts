import { type Receipt } from '../types/receipt'
import { calculateReceiptSplit } from './calculateSplit'
import { formatDate } from './formatDate'

const CARD_PALETTE = [
  { bg: '#FFF1EE', border: '#FECDC7', name: '#7F1D1D', amount: '#DC2626' },
  { bg: '#FFFBEB', border: '#FDE68A', name: '#78350F', amount: '#D97706' },
  { bg: '#F0FDF4', border: '#BBF7D0', name: '#14532D', amount: '#16A34A' },
  { bg: '#FAF5FF', border: '#E9D5FF', name: '#4C1D95', amount: '#7C3AED' },
  { bg: '#EFF6FF', border: '#BFDBFE', name: '#1E3A8A', amount: '#2563EB' },
  { bg: '#FFF1F2', border: '#FFE4E6', name: '#881337', amount: '#E11D48' },
]

const css = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,'Segoe UI',sans-serif;background:#F5EFE3;color:#1C1208}
  .page{max-width:700px;margin:32px auto;background:#FFFDF8;border-radius:4px;overflow:hidden;box-shadow:0 2px 24px rgba(0,0,0,0.12)}
  .header{background:#1A0F00;padding:40px 44px;position:relative;overflow:hidden}
  .header-glow{position:absolute;top:-60px;right:-60px;width:220px;height:220px;border-radius:50%;background:rgba(194,65,12,0.1)}
  .header-glow2{position:absolute;bottom:-80px;left:-30px;width:280px;height:280px;border-radius:50%;background:rgba(180,83,9,0.05)}
  .logo{height:26px;margin-bottom:24px;filter:brightness(0) invert(1);opacity:0.7}
  .header-top{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;position:relative}
  .header-eyebrow{font-size:10px;text-transform:uppercase;letter-spacing:3px;color:rgba(251,146,60,0.7);margin-bottom:8px;font-weight:600}
  .header-title{font-size:28px;font-weight:800;color:#FEFAF2;line-height:1.15;margin-bottom:12px}
  .header-sub{font-size:13px;color:rgba(254,250,242,0.4)}
  .total-block{text-align:right;flex-shrink:0}
  .total-label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:rgba(254,250,242,0.25);margin-bottom:6px}
  .total-amount{font-family:'Courier New',Courier,monospace;font-size:40px;font-weight:900;color:#FB923C;line-height:1}
  .total-sub{font-size:12px;color:rgba(254,250,242,0.3);margin-top:6px}
  .receipts-strip{position:relative;margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.07);display:flex;gap:12px;flex-wrap:wrap}
  .receipt-chip{font-size:11px;padding:4px 10px;border-radius:20px;background:rgba(255,255,255,0.07);color:rgba(254,250,242,0.5);font-weight:500}
  .receipt-chip strong{color:#FEFAF2}
  .body{padding:36px 44px}
  .section-label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#9A7B58;font-weight:700;margin-bottom:14px}
  .rule{border:none;border-top:1px dashed #DCC9A8;margin:28px 0}
  .rule-thick{border:none;border-top:3px solid #1A0F00;margin:36px 0}
  .overview-table{width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px dashed #DCC9A8}
  .overview-table thead tr{background:#FAF5EC}
  .overview-table th{padding:9px 14px;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#9A7B58;font-weight:700;border-bottom:1px dashed #DCC9A8;text-align:left}
  .overview-table th.r{text-align:right}
  .overview-table td{padding:10px 14px;font-size:13px;color:#3D2710;border-bottom:1px solid #F5EFE3}
  .overview-table td.r{text-align:right;font-family:'Courier New',Courier,monospace;font-weight:600}
  .overview-table tr:last-child td{border-bottom:none}
  .summary-row{background:#FAF5EC!important}
  .summary-row td{font-weight:700;color:#1A0F00;border-top:1px dashed #DCC9A8!important}
  .summary-row td.r{color:#C2410C;font-size:15px}
  .person-cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(158px,1fr));gap:12px}
  .person-card{border-radius:10px;padding:16px 18px;border-width:1.5px;border-style:solid}
  .card-name{font-size:13px;font-weight:700;margin-bottom:8px}
  .card-amount{font-family:'Courier New',Courier,monospace;font-size:24px;font-weight:900;line-height:1}
  .card-sub{font-size:11px;margin-top:5px;opacity:0.55}
  .receipt-section{margin-bottom:32px;border:1px dashed #DCC9A8;border-radius:10px;overflow:hidden}
  .receipt-section-header{background:#FAF5EC;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px dashed #DCC9A8}
  .receipt-section-title{font-size:14px;font-weight:700;color:#1A0F00}
  .receipt-section-date{font-size:11px;color:#9A7B58}
  .receipt-section-total{font-family:'Courier New',Courier,monospace;font-size:16px;font-weight:800;color:#C2410C}
  .receipt-section-body{padding:14px 18px}
  .mini-item-row{display:flex;justify-content:space-between;padding:5px 0;font-size:12px;color:#3D2710;border-bottom:1px solid #F5EFE3}
  .mini-item-row:last-child{border-bottom:none}
  .mini-amount{font-family:'Courier New',Courier,monospace;font-weight:600}
  .mini-totals{margin-top:10px;padding-top:10px;border-top:1px dashed #DCC9A8}
  .mini-totals-row{display:flex;justify-content:space-between;font-size:11px;color:#9A7B58;padding:2px 0}
  .mini-totals-row span:last-child{font-family:'Courier New',Courier,monospace}
  .mini-grand{display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:#1A0F00;padding:6px 0 0;margin-top:4px;border-top:1px solid #DCC9A8}
  .mini-grand span:last-child{font-family:'Courier New',Courier,monospace;color:#C2410C}
  .mini-persons{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
  .mini-person{font-size:11px;padding:2px 8px;border-radius:20px;background:#F5EFE3;color:#78614A;font-weight:500}
  .badge{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;padding:2px 6px;border-radius:4px}
  .badge-paid{background:#FEF3C7;color:#92400E}
  .badge-settled{background:#D1FAE5;color:#065F46}
  .footer{background:#FAF5EC;border-top:1px dashed #DCC9A8;padding:18px 44px;display:flex;justify-content:space-between;align-items:center}
  .footer img{height:16px;opacity:0.15}
  .footer-text{font-size:11px;color:#B8956A}
  @media print{body{background:#fff}.page{margin:0;box-shadow:none;border-radius:0}@page{margin:12mm 14mm;size:A4}}
`

export function generateCombinedReceiptPDF(receipts: Receipt[]) {
  if (receipts.length === 0) return

  const logoUrl = `${window.location.origin}/hootanglogo.png`
  const generatedOn = new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })

  // Aggregate grand totals
  const receiptTotals = receipts.map((r) => {
    const raw = r.items.reduce((s, i) => s + i.price * (i.quantity ?? 1), 0)
    const disc = Math.min(r.discount ?? 0, raw)
    const sub = raw - disc
    const tax = sub * (r.tax / 100)
    const svc = sub * (r.serviceCharge / 100)
    return { receipt: r, grandTotal: sub + tax + svc, raw, disc, tax, svc, sub }
  })
  const combinedTotal = receiptTotals.reduce((s, r) => s + r.grandTotal, 0)

  // Aggregate per-person across all receipts
  const personTotals: Record<string, number> = {}
  receipts.forEach((r) => {
    calculateReceiptSplit(r).forEach((share) => {
      personTotals[share.name] = (personTotals[share.name] ?? 0) + share.total
    })
  })

  // All unique participants
  const allParticipants = [...new Set(receipts.flatMap((r) => r.participants))]

  // Date range
  const dates = receipts.map((r) => r.date).sort()
  const dateRange = dates[0] === dates[dates.length - 1]
    ? formatDate(dates[0])
    : `${formatDate(dates[0])} – ${formatDate(dates[dates.length - 1])}`

  // Overview table rows
  const overviewRows = receiptTotals.map(({ receipt, grandTotal }) =>
    `<tr>
      <td>${receipt.title}</td>
      <td>${formatDate(receipt.date)}</td>
      <td>${receipt.participants.join(', ')}</td>
      <td class="r">RM ${grandTotal.toFixed(2)}</td>
    </tr>`
  ).join('')

  // Combined per-person cards
  const personCards = allParticipants.map((name, i) => {
    const c = CARD_PALETTE[i % CARD_PALETTE.length]
    const total = personTotals[name] ?? 0
    const receiptCount = receipts.filter((r) => r.participants.includes(name)).length
    return `<div class="person-card" style="background:${c.bg};border-color:${c.border}">
      <div class="card-name" style="color:${c.name}">${name}</div>
      <div class="card-amount" style="color:${c.amount}">RM ${total.toFixed(2)}</div>
      <div class="card-sub" style="color:${c.name}">across ${receiptCount} receipt${receiptCount !== 1 ? 's' : ''}</div>
    </div>`
  }).join('')

  // Individual receipt sections
  const receiptSections = receiptTotals.map(({ receipt, grandTotal, raw, disc, tax, svc }) => {
    const itemRows = receipt.items.map((item) => {
      const qty = item.quantity ?? 1
      return `<div class="mini-item-row">
        <span>${item.name}${qty > 1 ? ` <span style="color:#9A7B58">×${qty}</span>` : ''}</span>
        <span class="mini-amount">RM ${(item.price * qty).toFixed(2)}</span>
      </div>`
    }).join('')

    const shares = calculateReceiptSplit(receipt)
    const personBreakdown = shares.map((s) => {
      const isPayer = receipt.paidBy === s.name
      const settled = (receipt.settledBy ?? []).includes(s.name)
      const badge = isPayer
        ? ` <span class="badge badge-paid">paid</span>`
        : settled
        ? ` <span class="badge badge-settled">✓</span>`
        : ''
      return `<span class="mini-person">${s.name} RM ${s.total.toFixed(2)}${badge}</span>`
    }).join('')

    return `<div class="receipt-section">
      <div class="receipt-section-header">
        <div>
          <div class="receipt-section-title">${receipt.title}</div>
          <div class="receipt-section-date">${formatDate(receipt.date)} · ${receipt.splitMode} split${receipt.paidBy ? ` · paid by ${receipt.paidBy}` : ''}</div>
        </div>
        <div class="receipt-section-total">RM ${grandTotal.toFixed(2)}</div>
      </div>
      <div class="receipt-section-body">
        ${itemRows}
        <div class="mini-totals">
          <div class="mini-totals-row"><span>Subtotal</span><span>RM ${raw.toFixed(2)}</span></div>
          ${disc > 0 ? `<div class="mini-totals-row" style="color:#16A34A"><span>Discount</span><span>−RM ${disc.toFixed(2)}</span></div>` : ''}
          ${receipt.tax > 0 ? `<div class="mini-totals-row"><span>Tax (${receipt.tax}%)</span><span>RM ${tax.toFixed(2)}</span></div>` : ''}
          ${receipt.serviceCharge > 0 ? `<div class="mini-totals-row"><span>Service (${receipt.serviceCharge}%)</span><span>RM ${svc.toFixed(2)}</span></div>` : ''}
          <div class="mini-grand"><span>Total</span><span>RM ${grandTotal.toFixed(2)}</span></div>
        </div>
        <div class="mini-persons" style="margin-top:12px">${personBreakdown}</div>
      </div>
    </div>`
  }).join('')

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>Combined Receipt — Hootang</title><style>${css}</style></head>
<body><div class="page">

  <div class="header">
    <div class="header-glow"></div><div class="header-glow2"></div>
    <img class="logo" src="${logoUrl}" alt="Hootang"/>
    <div class="header-top">
      <div>
        <div class="header-eyebrow">Combined Bill</div>
        <div class="header-title">${receipts.length} Receipt${receipts.length !== 1 ? 's' : ''} Combined</div>
        <div class="header-sub">${dateRange} · ${allParticipants.length} participants</div>
      </div>
      <div class="total-block">
        <div class="total-label">Grand Total</div>
        <div class="total-amount">RM ${combinedTotal.toFixed(2)}</div>
        <div class="total-sub">${receipts.length} receipts combined</div>
      </div>
    </div>
    <div class="receipts-strip">
      ${receipts.map((r) => `<span class="receipt-chip"><strong>${r.title}</strong></span>`).join('')}
    </div>
  </div>

  <div class="body">
    <div class="section-label">Receipts Overview</div>
    <table class="overview-table">
      <thead><tr>
        <th>Receipt</th>
        <th>Date</th>
        <th>Participants</th>
        <th class="r">Amount</th>
      </tr></thead>
      <tbody>
        ${overviewRows}
        <tr class="summary-row">
          <td colspan="3"><strong>Combined Total</strong></td>
          <td class="r">RM ${combinedTotal.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <hr class="rule"/>

    <div class="section-label">Combined Amount Per Person</div>
    <div class="person-cards-grid">${personCards}</div>

    <hr class="rule-thick"/>

    <div class="section-label">Individual Receipts</div>
    ${receiptSections}
  </div>

  <div class="footer">
    <img src="${logoUrl}" alt="Hootang"/>
    <span class="footer-text">Generated by Hootang · ${generatedOn}</span>
  </div>
</div>
<script>window.onload = () => window.print()</script>
</body></html>`

  const win = window.open('', '_blank')
  if (win) { win.document.write(html); win.document.close() }
}
