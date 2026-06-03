import { type Receipt } from '../types/receipt'
import { calculateReceiptSplit } from './calculateSplit'
import { formatDate } from './formatDate'

const CATEGORY_LABELS: Record<string, string> = {
  food: 'Food & Drinks', transport: 'Transport', accommodation: 'Accommodation',
  entertainment: 'Entertainment', shopping: 'Shopping', utilities: 'Utilities', other: 'Other',
}

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
  .page{max-width:680px;margin:32px auto;background:#FFFDF8;border-radius:4px;overflow:hidden;box-shadow:0 2px 24px rgba(0,0,0,0.12)}
  .header{background:#1A0F00;padding:40px 44px;position:relative;overflow:hidden}
  .header-glow{position:absolute;top:-60px;right:-60px;width:200px;height:200px;border-radius:50%;background:rgba(194,65,12,0.12)}
  .header-glow2{position:absolute;bottom:-80px;left:-30px;width:260px;height:260px;border-radius:50%;background:rgba(180,83,9,0.06)}
  .logo{height:26px;margin-bottom:24px;filter:brightness(0) invert(1);opacity:0.7}
  .header-top{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;position:relative}
  .header-title{font-size:26px;font-weight:800;color:#FEFAF2;line-height:1.2;margin-bottom:10px;letter-spacing:-0.5px}
  .header-meta{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .meta-chip{font-size:11px;padding:3px 10px;border-radius:20px;font-weight:600}
  .chip-category{background:rgba(194,65,12,0.25);color:#FB923C}
  .chip-split{background:rgba(255,255,255,0.08);color:rgba(254,250,242,0.45);text-transform:capitalize}
  .total-block{text-align:right;flex-shrink:0}
  .total-label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:rgba(254,250,242,0.3);margin-bottom:6px}
  .total-amount{font-family:'Courier New',Courier,monospace;font-size:38px;font-weight:900;color:#FB923C;line-height:1}
  .receipt-no{font-size:11px;color:rgba(254,250,242,0.2);margin-top:6px}
  .paid-by-strip{position:relative;margin-top:22px;padding-top:18px;border-top:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;gap:8px}
  .paid-dot{width:6px;height:6px;border-radius:50%;background:#C2410C;flex-shrink:0}
  .paid-text{font-size:12px;color:rgba(254,250,242,0.4)}
  .paid-name{color:#FEFAF2;font-weight:700}
  .body{padding:36px 44px}
  .section-label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#9A7B58;font-weight:700;margin-bottom:14px}
  .rule{border:none;border-top:1px dashed #DCC9A8;margin:28px 0}
  table{width:100%;border-collapse:collapse;margin-bottom:4px}
  thead tr{background:#FAF5EC}
  th{padding:9px 14px;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#9A7B58;font-weight:700;border-bottom:1px dashed #DCC9A8}
  th.r{text-align:right}th.c{text-align:center}
  td{padding:10px 14px;font-size:13px;color:#3D2710;border-bottom:1px solid #F5EFE3;vertical-align:top}
  td.r{text-align:right}td.c{text-align:center;color:#9A7B58}
  td.price{font-family:'Courier New',Courier,monospace;font-weight:600;text-align:right}
  td.total-cell{font-family:'Courier New',Courier,monospace;font-weight:700;text-align:right;color:#1A0F00}
  .item-name{font-weight:500}
  .item-assigned{font-size:11px;color:#B8956A;margin-top:3px}
  .totals-wrap{display:flex;justify-content:flex-end}
  .totals{width:260px;background:#FAF5EC;border-radius:8px;padding:16px;border:1px dashed #DCC9A8}
  .totals-row{display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#78614A;border-bottom:1px solid #EDE3D4}
  .totals-row span:last-child{font-family:'Courier New',Courier,monospace}
  .totals-row.discount{color:#16A34A}
  .totals-grand{display:flex;justify-content:space-between;padding:10px 0 0;font-size:16px;font-weight:800;color:#1A0F00}
  .totals-grand span:last-child{font-family:'Courier New',Courier,monospace;color:#C2410C}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}
  .participants-box{background:#FAF5EC;border-radius:8px;padding:16px;border:1px dashed #DCC9A8}
  .participant-row{display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px;color:#3D2710;border-bottom:1px solid #EDE3D4}
  .badge{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;padding:2px 6px;border-radius:4px}
  .badge-paid{background:#FEF3C7;color:#92400E}
  .badge-settled{background:#D1FAE5;color:#065F46}
  .badge-pending{background:#F5F5F5;color:#9CA3AF}
  .cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(158px,1fr));gap:12px}
  .person-card{border-radius:10px;padding:16px 18px;border-width:1.5px;border-style:solid}
  .card-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px}
  .card-name{font-size:13px;font-weight:700}
  .card-amount{font-family:'Courier New',Courier,monospace;font-size:22px;font-weight:900;line-height:1}
  .card-owes{font-size:11px;margin-top:6px;opacity:0.6}
  .footer{background:#FAF5EC;border-top:1px dashed #DCC9A8;padding:18px 44px;display:flex;justify-content:space-between;align-items:center}
  .footer img{height:16px;opacity:0.15}
  .footer-text{font-size:11px;color:#B8956A}
  @media print{body{background:#fff}.page{margin:0;box-shadow:none;border-radius:0}@page{margin:12mm 14mm;size:A4}}
`

export function generateReceiptPDF(receipt: Receipt) {
  const shares = calculateReceiptSplit(receipt)
  const rawSubtotal = receipt.items.reduce((sum, i) => sum + i.price * (i.quantity ?? 1), 0)
  const discountAmt = Math.min(receipt.discount ?? 0, rawSubtotal)
  const subtotal = rawSubtotal - discountAmt
  const taxAmt = subtotal * (receipt.tax / 100)
  const serviceAmt = subtotal * (receipt.serviceCharge / 100)
  const grandTotal = subtotal + taxAmt + serviceAmt
  const logoUrl = `${window.location.origin}/hootanglogo.png`
  const settledBy = receipt.settledBy ?? []
  const generatedOn = new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })

  const itemRows = receipt.items.map((item, i) => {
    const qty = item.quantity ?? 1
    const total = item.price * qty
    const assigned = receipt.splitMode === 'itemized' && item.assignedTo.length > 0
      ? `<div class="item-assigned">${item.assignedTo.join(' · ')}</div>` : ''
    const bg = i % 2 === 0 ? '' : 'style="background:#FAF5EC"'
    return `<tr ${bg}>
      <td><div class="item-name">${item.name}</div>${assigned}</td>
      <td class="c">${qty > 1 ? qty : '—'}</td>
      <td class="price">RM ${item.price.toFixed(2)}</td>
      <td class="total-cell">RM ${total.toFixed(2)}</td>
    </tr>`
  }).join('')

  const personCards = shares.map((share, i) => {
    const c = CARD_PALETTE[i % CARD_PALETTE.length]
    const isPayer = receipt.paidBy === share.name
    const settled = settledBy.includes(share.name)
    const badgeHtml = isPayer
      ? `<span class="badge badge-paid">Paid</span>`
      : settled
      ? `<span class="badge badge-settled">Settled</span>`
      : ''
    const owes = receipt.paidBy && !isPayer
      ? `<div class="card-owes" style="color:${c.name}">owes ${receipt.paidBy}</div>` : ''
    return `<div class="person-card" style="background:${c.bg};border-color:${c.border}">
      <div class="card-top">
        <div class="card-name" style="color:${c.name}">${share.name}</div>
        ${badgeHtml}
      </div>
      <div class="card-amount" style="color:${c.amount}">RM ${share.total.toFixed(2)}</div>
      ${owes}
    </div>`
  }).join('')

  const participantRows = receipt.participants.map((p) => {
    const isPayer = receipt.paidBy === p
    const settled = settledBy.includes(p)
    const badge = isPayer
      ? `<span class="badge badge-paid">Paid</span>`
      : settled
      ? `<span class="badge badge-settled">Settled</span>`
      : `<span class="badge badge-pending">Pending</span>`
    return `<div class="participant-row"><span>${p}</span>${badge}</div>`
  }).join('')

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>${receipt.title} — Hootang</title><style>${css}</style></head>
<body><div class="page">

  <div class="header">
    <div class="header-glow"></div><div class="header-glow2"></div>
    <img class="logo" src="${logoUrl}" alt="Hootang"/>
    <div class="header-top">
      <div>
        <div class="header-title">${receipt.title}</div>
        <div class="header-meta">
          <span class="meta-chip chip-category">${formatDate(receipt.date)}</span>
          ${receipt.category ? `<span class="meta-chip chip-category">${CATEGORY_LABELS[receipt.category] ?? receipt.category}</span>` : ''}
          <span class="meta-chip chip-split">${receipt.splitMode} split</span>
        </div>
      </div>
      <div class="total-block">
        <div class="total-label">Grand Total</div>
        <div class="total-amount">RM ${grandTotal.toFixed(2)}</div>
        <div class="receipt-no">#${receipt.id.slice(0, 8).toUpperCase()}</div>
      </div>
    </div>
    ${receipt.paidBy ? `<div class="paid-by-strip"><div class="paid-dot"></div>
      <span class="paid-text">Paid upfront by <span class="paid-name">${receipt.paidBy}</span></span></div>` : ''}
  </div>

  <div class="body">
    <div class="section-label">Items</div>
    <table>
      <thead><tr>
        <th style="text-align:left">Description</th>
        <th class="c">Qty</th>
        <th class="r">Unit Price</th>
        <th class="r">Total</th>
      </tr></thead>
      <tbody>${itemRows}</tbody>
    </table>

    <hr class="rule"/>

    <div class="two-col">
      <div>
        <div class="section-label">Summary</div>
        <div class="totals">
          <div class="totals-row"><span>Subtotal</span><span>RM ${rawSubtotal.toFixed(2)}</span></div>
          ${discountAmt > 0 ? `<div class="totals-row discount"><span>Discount</span><span>−RM ${discountAmt.toFixed(2)}</span></div>` : ''}
          ${receipt.tax > 0 ? `<div class="totals-row"><span>Tax (${receipt.tax}%)</span><span>RM ${taxAmt.toFixed(2)}</span></div>` : ''}
          ${receipt.serviceCharge > 0 ? `<div class="totals-row"><span>Service (${receipt.serviceCharge}%)</span><span>RM ${serviceAmt.toFixed(2)}</span></div>` : ''}
          <div class="totals-grand"><span>Grand Total</span><span>RM ${grandTotal.toFixed(2)}</span></div>
        </div>
      </div>
      <div>
        <div class="section-label">Participants</div>
        <div class="participants-box">${participantRows}</div>
      </div>
    </div>

    <hr class="rule"/>

    <div class="section-label">Amount Per Person</div>
    <div class="cards-grid">${personCards}</div>
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
