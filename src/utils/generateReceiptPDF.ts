import { type Receipt } from '../types/receipt'
import { calculateReceiptSplit } from './calculateSplit'
import { formatDate } from './formatDate'

const CATEGORY_LABELS: Record<string, string> = {
  food: 'Food & Drinks', transport: 'Transport', accommodation: 'Accommodation',
  entertainment: 'Entertainment', shopping: 'Shopping', utilities: 'Utilities', other: 'Other',
}

// Avatar colours: soft tint background + strong foreground, cycled per person
const AVATAR_PALETTE = [
  { bg: '#E0F7F8', fg: '#00747A' },
  { bg: '#FFF1DB', fg: '#B45309' },
  { bg: '#EDE9FE', fg: '#6D28D9' },
  { bg: '#FFE4E6', fg: '#BE123C' },
  { bg: '#DCFCE7', fg: '#15803D' },
  { bg: '#E0ECFF', fg: '#1D4ED8' },
]

const esc = (value: string | number): string =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const rm = (n: number): string => `RM ${n.toFixed(2)}`

const initials = (name: string): string => {
  const parts = name.trim().split(/\s+/)
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.trim().slice(0, 2)
  return esc(letters.toUpperCase())
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&family=Syne:wght@800&display=swap');
  :root{
    --ink:#1F2933;--ink-2:#52606D;--ink-3:#8A95A3;
    --line:#E4E7EB;--line-2:#F0F2F5;--paper:#FFFFFF;--canvas:#EEF1F4;
    --dark:#222831;--dark-2:#2E3540;--accent:#00ADB5;--accent-dark:#00747A;--accent-soft:#E0F7F8;
    --green:#15803D;--green-soft:#DCFCE7;--amber:#B45309;--amber-soft:#FEF3C7;
  }
  *{margin:0;padding:0;box-sizing:border-box}
  html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body{font-family:'Inter',-apple-system,'Segoe UI',sans-serif;background:var(--canvas);color:var(--ink);font-size:13px;line-height:1.45}
  .mono{font-family:'JetBrains Mono','Courier New',monospace;font-variant-numeric:tabular-nums}
  .page{max-width:720px;margin:32px auto;background:var(--paper);border-radius:14px;overflow:hidden;box-shadow:0 10px 40px rgba(31,41,51,.14)}

  /* Header */
  .header{background:var(--dark);color:#fff;padding:34px 44px 30px;position:relative;overflow:hidden}
  .header::before{content:'';position:absolute;top:-90px;right:-70px;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(0,173,181,.35),rgba(0,173,181,0) 70%)}
  .header::after{content:'';position:absolute;left:0;right:0;bottom:0;height:4px;background:linear-gradient(90deg,var(--accent),#5EEAD4 60%,rgba(94,234,212,0))}
  .brand{display:flex;align-items:center;gap:10px;margin-bottom:26px;position:relative}
  .brand img{width:36px;height:36px;border-radius:9px;display:block;box-shadow:0 0 0 1px rgba(255,255,255,.12)}
  .wordmark{font-family:'Syne','Inter',sans-serif;font-weight:800;letter-spacing:-.4px}
  .wordmark .hoo{color:#00ADB5}.wordmark .tang{color:#EEEEEE}
  .brand-name{font-size:21px;line-height:1}
  .foot-brand .wordmark .tang{color:var(--dark)}
  .foot-brand .wordmark{font-size:14px}
  .brand-tag{font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,.45);font-weight:600;margin-left:auto}
  .head-row{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;position:relative}
  .title{font-size:26px;font-weight:800;line-height:1.15;letter-spacing:-.5px;margin-bottom:12px;word-break:break-word}
  .chips{display:flex;gap:6px;flex-wrap:wrap}
  .chip{font-size:11px;font-weight:600;padding:4px 10px;border-radius:999px;background:rgba(255,255,255,.1);color:rgba(255,255,255,.8);text-transform:capitalize}
  .chip.accent{background:rgba(0,173,181,.22);color:#7DEAF0}
  .total-block{text-align:right;flex-shrink:0}
  .total-label{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.45);font-weight:600;margin-bottom:6px}
  .total-amount{font-size:34px;font-weight:700;line-height:1;color:#fff}
  .total-amount small{font-size:15px;color:#7DEAF0;margin-right:4px;font-weight:700}
  .ref{font-size:10px;color:rgba(255,255,255,.35);margin-top:8px;letter-spacing:1px}

  /* Body */
  .body{padding:32px 44px 8px}
  .section{margin-bottom:30px;page-break-inside:avoid}
  .section-head{display:flex;align-items:center;gap:10px;margin-bottom:14px}
  .section-head h2{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--ink-3);font-weight:700;white-space:nowrap}
  .section-head::after{content:'';flex:1;height:1px;background:var(--line)}

  /* Who pays banner */
  .payer{display:flex;align-items:center;gap:12px;background:var(--accent-soft);border:1px solid #B6ECEF;border-radius:12px;padding:12px 16px;margin-bottom:28px}
  .payer .avatar{width:34px;height:34px;font-size:12px}
  .payer-text{font-size:12px;color:var(--accent-dark)}
  .payer-text strong{display:block;font-size:14px;color:var(--dark);font-weight:700}
  .payer-amount{margin-left:auto;text-align:right;font-size:11px;color:var(--accent-dark)}
  .payer-amount strong{display:block;font-size:14px;color:var(--dark)}

  /* Avatars */
  .avatar{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex-shrink:0;letter-spacing:.5px}

  /* Per person */
  .people{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .person{border:1px solid var(--line);border-radius:12px;padding:14px 16px;page-break-inside:avoid;background:#fff}
  .person-top{display:flex;align-items:center;gap:10px;margin-bottom:12px}
  .person-name{font-weight:700;font-size:14px;color:var(--dark);word-break:break-word}
  .person-sub{font-size:11px;color:var(--ink-3)}
  .status{margin-left:auto;font-size:9.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;padding:3px 8px;border-radius:999px;white-space:nowrap}
  .status.paid{background:var(--amber-soft);color:var(--amber)}
  .status.settled{background:var(--green-soft);color:var(--green)}
  .status.pending{background:var(--line-2);color:var(--ink-3)}
  .person-amount{font-size:24px;font-weight:700;color:var(--dark);line-height:1;margin-bottom:10px}
  .person-amount small{font-size:12px;color:var(--ink-3);margin-right:3px}
  .breakdown{border-top:1px dashed var(--line);padding-top:8px}
  .breakdown div{display:flex;justify-content:space-between;font-size:11px;color:var(--ink-2);padding:1.5px 0}
  .breakdown .neg{color:var(--green)}

  /* Items */
  table{width:100%;border-collapse:collapse}
  thead th{font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--ink-3);font-weight:700;padding:0 10px 8px;text-align:left;border-bottom:2px solid var(--dark)}
  thead th.r{text-align:right}thead th.c{text-align:center}
  tbody td{padding:11px 10px;border-bottom:1px solid var(--line-2);vertical-align:top}
  tbody tr{page-break-inside:avoid}
  td.c{text-align:center;color:var(--ink-3)}
  td.r{text-align:right;white-space:nowrap}
  .item-name{font-weight:600;color:var(--dark)}
  .tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px}
  .tag{font-size:10px;font-weight:600;padding:2px 8px;border-radius:999px;background:var(--accent-soft);color:var(--accent-dark)}
  .tag em{font-style:normal;opacity:.7;margin-left:3px;font-family:'JetBrains Mono',monospace}
  .muted{color:var(--ink-3)}

  /* Summary + settle */
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}
  .card{background:#F7F9FA;border:1px solid var(--line);border-radius:12px;padding:16px 18px}
  .row{display:flex;justify-content:space-between;padding:5px 0;font-size:12.5px;color:var(--ink-2)}
  .row.discount{color:var(--green)}
  .row.grand{margin-top:8px;padding-top:12px;border-top:2px solid var(--dark);font-size:15px;font-weight:800;color:var(--dark)}
  .row.grand .mono{color:var(--accent-dark)}
  .settle-row{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--line);font-size:12.5px}
  .settle-row:last-child{border-bottom:none}
  .settle-row .arrow{color:var(--accent);font-weight:700}
  .settle-row .amt{margin-left:auto;font-weight:700;color:var(--dark)}
  .settle-row.done{opacity:.55}
  .settle-row.done .amt{text-decoration:line-through}
  .empty{font-size:12px;color:var(--ink-3)}
  .qr-card{display:flex;align-items:center;gap:20px;border:1px solid var(--line);border-radius:12px;padding:16px 20px;page-break-inside:avoid}
  .qr-card img{width:132px;height:132px;object-fit:contain;border-radius:8px;border:1px solid var(--line);padding:6px;background:#fff;flex-shrink:0}
  .qr-title{font-size:15px;font-weight:800;color:var(--dark);margin-bottom:4px}
  .qr-sub{font-size:12px;color:var(--ink-2);margin-bottom:10px}
  .qr-sub strong{color:var(--dark)}
  .qr-list .row{padding:3px 0;font-size:12px}

  /* Footer */
  .footer{margin-top:6px;padding:18px 44px;background:#F7F9FA;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--ink-3)}
  .footer .foot-brand{display:flex;align-items:center;gap:8px;font-weight:700;color:var(--ink-2)}
  .footer img{width:20px;height:20px;border-radius:5px;display:block}

  @media (max-width:560px){
    .body{padding:24px 20px 4px}.header{padding:26px 20px}.footer{padding:16px 20px}
    .head-row{flex-direction:column;align-items:flex-start}.total-block{text-align:left}
    .people,.two-col{grid-template-columns:1fr}
  }
  @media print{
    body{background:#fff}
    .page{margin:0;box-shadow:none;border-radius:0;max-width:none}
    @page{margin:10mm;size:A4}
  }
`

export interface ReceiptPDFOptions {
  /** DuitNow QR to print on the receipt; omit to leave it out. */
  qrDataUrl?: string
}

export function generateReceiptPDF(receipt: Receipt, options: ReceiptPDFOptions = {}) {
  const shares = calculateReceiptSplit(receipt)
  const rawSubtotal = receipt.items.reduce((sum, i) => sum + i.price * (i.quantity ?? 1), 0)
  const discountAmt = Math.min(receipt.discount ?? 0, rawSubtotal)
  const subtotal = rawSubtotal - discountAmt
  const taxAmt = subtotal * (receipt.tax / 100)
  const serviceAmt = subtotal * (receipt.serviceCharge / 100)
  const grandTotal = subtotal + taxAmt + serviceAmt
  const logoUrl = `${window.location.origin}/logo.svg`
  const settledBy = receipt.settledBy ?? []
  const generatedOn = new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })

  const colorOf = (name: string) => AVATAR_PALETTE[Math.max(0, receipt.participants.indexOf(name)) % AVATAR_PALETTE.length]
  const avatar = (name: string) => {
    const c = colorOf(name)
    return `<div class="avatar" style="background:${c.bg};color:${c.fg}">${initials(name)}</div>`
  }

  const itemized = receipt.splitMode === 'itemized'

  const itemRows = receipt.items.map((item) => {
    const qty = item.quantity ?? 1
    const total = item.price * qty
    const tags = itemized && item.assignedTo.length > 0
      ? `<div class="tags">${item.assignedTo.map((p) =>
          `<span class="tag">${esc(p)}${item.customAmounts ? `<em>${rm(item.customAmounts[p] ?? 0)}</em>` : ''}</span>`
        ).join('')}</div>`
      : ''
    return `<tr>
      <td><div class="item-name">${esc(item.name)}</div>${tags}</td>
      <td class="c">${qty > 1 ? qty : '—'}</td>
      <td class="r mono muted">${rm(item.price)}</td>
      <td class="r mono"><strong>${rm(total)}</strong></td>
    </tr>`
  }).join('')

  const personCards = shares.map((share) => {
    const isPayer = receipt.paidBy === share.name
    const settled = settledBy.includes(share.name)
    const status = isPayer
      ? `<span class="status paid">Paid upfront</span>`
      : settled
        ? `<span class="status settled">Settled</span>`
        : receipt.paidBy ? `<span class="status pending">Pending</span>` : ''
    const sub = receipt.paidBy && !isPayer ? `owes ${esc(receipt.paidBy)}` : ''
    return `<div class="person">
      <div class="person-top">
        ${avatar(share.name)}
        <div><div class="person-name">${esc(share.name)}</div>${sub ? `<div class="person-sub">${sub}</div>` : ''}</div>
        ${status}
      </div>
      <div class="person-amount mono"><small>RM</small>${share.total.toFixed(2)}</div>
      <div class="breakdown mono">
        <div><span>Items</span><span>${rm(share.subtotal)}</span></div>
        ${share.discountAmount > 0.004 ? `<div class="neg"><span>Discount</span><span>−${rm(share.discountAmount)}</span></div>` : ''}
        ${share.taxAmount > 0.004 ? `<div><span>Tax</span><span>${rm(share.taxAmount)}</span></div>` : ''}
        ${share.serviceAmount > 0.004 ? `<div><span>Service</span><span>${rm(share.serviceAmount)}</span></div>` : ''}
      </div>
    </div>`
  }).join('')

  const owedToPayer = shares
    .filter((s) => s.name !== receipt.paidBy && !settledBy.includes(s.name))
    .reduce((sum, s) => sum + s.total, 0)

  const payerBanner = receipt.paidBy
    ? `<div class="payer">
        ${avatar(receipt.paidBy)}
        <div class="payer-text">Paid the bill upfront<strong>${esc(receipt.paidBy)}</strong></div>
        <div class="payer-amount">${owedToPayer > 0.004 ? 'Still to collect' : 'All settled'}<strong class="mono">${owedToPayer > 0.004 ? rm(owedToPayer) : '✓'}</strong></div>
      </div>`
    : ''

  const settleRows = receipt.paidBy
    ? shares.filter((s) => s.name !== receipt.paidBy).map((s) => {
        const done = settledBy.includes(s.name)
        return `<div class="settle-row${done ? ' done' : ''}">
          <span>${esc(s.name)}</span><span class="arrow">→</span><span>${esc(receipt.paidBy)}</span>
          <span class="amt mono">${rm(s.total)}</span>
        </div>`
      }).join('')
    : ''

  const owing = shares.filter((s) => s.name !== receipt.paidBy && !settledBy.includes(s.name))
  const qrSection = options.qrDataUrl && receipt.paidBy
    ? `<div class="section">
      <div class="section-head"><h2>Pay via DuitNow</h2></div>
      <div class="qr-card">
        <img src="${esc(options.qrDataUrl)}" alt="DuitNow QR"/>
        <div class="qr-list" style="flex:1">
          <div class="qr-title">Scan to pay ${esc(receipt.paidBy)}</div>
          <div class="qr-sub">${owing.length > 0 ? 'Transfer your share using any banking or e-wallet app.' : 'Everyone has settled. Thank you!'}</div>
          ${owing.map((s) => `<div class="row"><span>${esc(s.name)}</span><span class="mono"><strong>${rm(s.total)}</strong></span></div>`).join('')}
        </div>
      </div>
    </div>`
    : ''

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(receipt.title)} — Hootang</title><style>${css}</style></head>
<body><div class="page">

  <div class="header">
    <div class="brand"><img src="${logoUrl}" alt=""/><span class="brand-name"><span class="wordmark"><span class="hoo">hoo</span><span class="tang">tang</span></span></span><span class="brand-tag">Split Receipt</span></div>
    <div class="head-row">
      <div>
        <div class="title">${esc(receipt.title)}</div>
        <div class="chips">
          <span class="chip accent">${esc(formatDate(receipt.date))}</span>
          ${receipt.category ? `<span class="chip">${esc(CATEGORY_LABELS[receipt.category] ?? receipt.category)}</span>` : ''}
          <span class="chip">${esc(receipt.splitMode)} split</span>
          <span class="chip">${receipt.participants.length} ${receipt.participants.length === 1 ? 'person' : 'people'}</span>
        </div>
      </div>
      <div class="total-block">
        <div class="total-label">Grand Total</div>
        <div class="total-amount mono"><small>RM</small>${grandTotal.toFixed(2)}</div>
        <div class="ref">#${esc(receipt.id.slice(0, 8).toUpperCase())}</div>
      </div>
    </div>
  </div>

  <div class="body">
    ${payerBanner}

    <div class="section">
      <div class="section-head"><h2>Amount per person</h2></div>
      <div class="people">${personCards}</div>
    </div>

    <div class="section">
      <div class="section-head"><h2>Items</h2></div>
      <table>
        <thead><tr>
          <th>Description</th><th class="c">Qty</th><th class="r">Unit</th><th class="r">Total</th>
        </tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>

    ${qrSection}

    <div class="section">
      <div class="two-col">
        <div>
          <div class="section-head"><h2>Summary</h2></div>
          <div class="card">
            <div class="row"><span>Subtotal</span><span class="mono">${rm(rawSubtotal)}</span></div>
            ${discountAmt > 0 ? `<div class="row discount"><span>Discount</span><span class="mono">−${rm(discountAmt)}</span></div>` : ''}
            ${receipt.tax > 0 ? `<div class="row"><span>Tax (${receipt.tax}%)</span><span class="mono">${rm(taxAmt)}</span></div>` : ''}
            ${receipt.serviceCharge > 0 ? `<div class="row"><span>Service (${receipt.serviceCharge}%)</span><span class="mono">${rm(serviceAmt)}</span></div>` : ''}
            <div class="row grand"><span>Grand Total</span><span class="mono">${rm(grandTotal)}</span></div>
          </div>
        </div>
        <div>
          <div class="section-head"><h2>Settle up</h2></div>
          <div class="card">
            ${settleRows || '<div class="empty">No one marked as the payer for this receipt.</div>'}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <span class="foot-brand"><img src="${logoUrl}" alt=""/><span class="wordmark"><span class="hoo">hoo</span><span class="tang">tang</span></span></span>
    <span>Generated by Hootang · ${generatedOn}</span>
  </div>
</div>
<script>window.onload = () => setTimeout(() => window.print(), 400)</script>
</body></html>`

  const win = window.open('', '_blank')
  if (win) { win.document.write(html); win.document.close() }
}
