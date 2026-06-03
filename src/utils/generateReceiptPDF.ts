import { type Receipt } from '../types/receipt'
import { calculateReceiptSplit } from './calculateSplit'
import { formatDate } from './formatDate'

const CATEGORY_LABELS: Record<string, string> = {
  food: 'Food & Drinks', transport: 'Transport', accommodation: 'Accommodation',
  entertainment: 'Entertainment', shopping: 'Shopping', utilities: 'Utilities', other: 'Other',
}

const CARD_COLORS = [
  { bg: '#ecfdf5', border: '#a7f3d0', name: '#065f46', amount: '#10b981' },
  { bg: '#eff6ff', border: '#bfdbfe', name: '#1e40af', amount: '#3b82f6' },
  { bg: '#fdf4ff', border: '#e9d5ff', name: '#6b21a8', amount: '#a855f7' },
  { bg: '#fff7ed', border: '#fed7aa', name: '#9a3412', amount: '#f97316' },
  { bg: '#f0fdfa', border: '#99f6e4', name: '#134e4a', amount: '#14b8a6' },
  { bg: '#fef2f2', border: '#fecaca', name: '#991b1b', amount: '#ef4444' },
]

export function generateReceiptPDF(receipt: Receipt) {
  const shares = calculateReceiptSplit(receipt)
  const rawSubtotal = receipt.items.reduce((sum, i) => sum + i.price * (i.quantity ?? 1), 0)
  const discountAmt = Math.min(receipt.discount ?? 0, rawSubtotal)
  const subtotal = rawSubtotal - discountAmt
  const taxAmt = subtotal * (receipt.tax / 100)
  const serviceAmt = subtotal * (receipt.serviceCharge / 100)
  const grandTotal = subtotal + taxAmt + serviceAmt
  const logoUrl = `${window.location.origin}/hootanglogo.png`
  const formattedDate = formatDate(receipt.date)
  const generatedOn = new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
  const settledBy = receipt.settledBy ?? []

  const itemRows = receipt.items.map((item, i) => {
    const qty = item.quantity ?? 1
    const total = item.price * qty
    const bg = i % 2 === 0 ? '#ffffff' : '#f9fafb'
    const assignedHtml = receipt.splitMode === 'itemized' && item.assignedTo.length > 0
      ? `<div style="font-size:11px;color:#9ca3af;margin-top:3px">${item.assignedTo.join(' · ')}</div>`
      : ''
    return `
      <tr style="background:${bg}">
        <td style="padding:10px 16px;font-size:13px;color:#374151;vertical-align:top">
          <div style="font-weight:500">${item.name}</div>${assignedHtml}
        </td>
        <td style="padding:10px 16px;font-size:13px;color:#9ca3af;text-align:center;vertical-align:top">${qty > 1 ? qty : '—'}</td>
        <td style="padding:10px 16px;font-size:13px;color:#6b7280;text-align:right;vertical-align:top">RM ${item.price.toFixed(2)}</td>
        <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#111827;text-align:right;vertical-align:top">RM ${total.toFixed(2)}</td>
      </tr>`
  }).join('')

  const personCards = shares.map((share, i) => {
    const c = CARD_COLORS[i % CARD_COLORS.length]
    const isPayer = receipt.paidBy === share.name
    const settled = settledBy.includes(share.name)
    const badge = isPayer
      ? `<span style="font-size:10px;padding:2px 6px;border-radius:20px;background:rgba(0,173,181,0.15);color:#00ADB5;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Paid</span>`
      : settled
      ? `<span style="font-size:10px;padding:2px 6px;border-radius:20px;background:rgba(16,185,129,0.15);color:#10b981;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Settled ✓</span>`
      : ''
    const owesLine = receipt.paidBy && !isPayer
      ? `<div style="font-size:11px;color:${c.name};opacity:0.6;margin-top:4px">owes ${receipt.paidBy}</div>`
      : ''
    return `
      <div style="background:${c.bg};border:1.5px solid ${c.border};border-radius:14px;padding:16px 18px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
          <div style="font-size:13px;font-weight:700;color:${c.name}">${share.name}</div>
          ${badge}
        </div>
        <div style="font-size:26px;font-weight:900;color:${c.amount};line-height:1">RM ${share.total.toFixed(2)}</div>
        ${owesLine}
      </div>`
  }).join('')

  const participantRows = receipt.participants.map((p) => {
    const isPayer = receipt.paidBy === p
    const settled = settledBy.includes(p)
    const badge = isPayer
      ? `<span style="font-size:10px;color:#00ADB5;font-weight:700">PAID</span>`
      : settled
      ? `<span style="font-size:10px;color:#10b981;font-weight:700">SETTLED</span>`
      : `<span style="font-size:10px;color:#d1d5db;font-weight:500">PENDING</span>`
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151">
        <span>${p}</span>${badge}
      </div>`
  }).join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${receipt.title} — Hootang</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,'Segoe UI',Arial,sans-serif;background:#f3f4f6}
    @media print{body{background:#fff}@page{margin:12mm 14mm;size:A4}}
  </style>
</head>
<body>
<div style="max-width:700px;margin:32px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.1)">

  <!-- Dark header -->
  <div style="background:linear-gradient(135deg,#0d1117 0%,#161f2e 100%);padding:36px 40px;position:relative;overflow:hidden">
    <div style="position:absolute;top:-30px;right:-30px;width:160px;height:160px;border-radius:50%;background:rgba(0,173,181,0.07)"></div>
    <div style="position:absolute;bottom:-50px;left:-20px;width:220px;height:220px;border-radius:50%;background:rgba(0,173,181,0.04)"></div>
    <div style="position:relative;display:flex;justify-content:space-between;align-items:flex-start;gap:20px">
      <div>
        <img src="${logoUrl}" alt="Hootang" style="height:28px;margin-bottom:20px;filter:brightness(0) invert(1);opacity:0.9"/>
        <div style="font-size:24px;font-weight:800;color:#ffffff;margin-bottom:8px;line-height:1.2">${receipt.title}</div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <span style="font-size:13px;color:rgba(255,255,255,0.45)">${formattedDate}</span>
          ${receipt.category ? `<span style="font-size:11px;padding:3px 10px;border-radius:20px;background:rgba(0,173,181,0.15);color:#00ADB5;font-weight:600">${CATEGORY_LABELS[receipt.category] ?? receipt.category}</span>` : ''}
          <span style="font-size:11px;padding:3px 10px;border-radius:20px;background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.4);text-transform:capitalize">${receipt.splitMode} split</span>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.25);margin-bottom:6px">Grand Total</div>
        <div style="font-size:36px;font-weight:900;color:#00ADB5;line-height:1">RM ${grandTotal.toFixed(2)}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.2);margin-top:6px">#${receipt.id.slice(0, 8).toUpperCase()}</div>
      </div>
    </div>
    ${receipt.paidBy ? `
    <div style="position:relative;margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;gap:10px">
      <div style="width:7px;height:7px;border-radius:50%;background:#00ADB5;flex-shrink:0"></div>
      <span style="font-size:13px;color:rgba(255,255,255,0.4)">Paid upfront by <strong style="color:#ffffff">${receipt.paidBy}</strong></span>
    </div>` : ''}
  </div>

  <!-- Body -->
  <div style="padding:36px 40px">

    <!-- Items table -->
    <div style="margin-bottom:32px">
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;font-weight:700;margin-bottom:14px">Items</div>
      <div style="border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#f9fafb">
              <th style="padding:10px 16px;font-size:10px;text-transform:uppercase;letter-spacing:0.8px;color:#9ca3af;font-weight:700;text-align:left">Item</th>
              <th style="padding:10px 16px;font-size:10px;text-transform:uppercase;letter-spacing:0.8px;color:#9ca3af;font-weight:700;text-align:center">Qty</th>
              <th style="padding:10px 16px;font-size:10px;text-transform:uppercase;letter-spacing:0.8px;color:#9ca3af;font-weight:700;text-align:right">Unit Price</th>
              <th style="padding:10px 16px;font-size:10px;text-transform:uppercase;letter-spacing:0.8px;color:#9ca3af;font-weight:700;text-align:right">Total</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
      </div>
    </div>

    <!-- Summary + Participants row -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px;align-items:start">

      <!-- Totals -->
      <div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;font-weight:700;margin-bottom:14px">Summary</div>
        <div style="background:#f9fafb;border-radius:12px;padding:16px;border:1px solid #f3f4f6">
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#6b7280;border-bottom:1px solid #f3f4f6">
            <span>Subtotal</span><span>RM ${rawSubtotal.toFixed(2)}</span>
          </div>
          ${discountAmt > 0 ? `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#10b981;border-bottom:1px solid #f3f4f6"><span>Discount</span><span>−RM ${discountAmt.toFixed(2)}</span></div>` : ''}
          ${receipt.tax > 0 ? `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#6b7280;border-bottom:1px solid #f3f4f6"><span>Tax (${receipt.tax}%)</span><span>RM ${taxAmt.toFixed(2)}</span></div>` : ''}
          ${receipt.serviceCharge > 0 ? `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#6b7280;border-bottom:1px solid #f3f4f6"><span>Service (${receipt.serviceCharge}%)</span><span>RM ${serviceAmt.toFixed(2)}</span></div>` : ''}
          <div style="display:flex;justify-content:space-between;padding:10px 0 0;font-size:15px;font-weight:800;color:#111827">
            <span>Grand Total</span><span style="color:#00ADB5">RM ${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <!-- Participants -->
      <div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;font-weight:700;margin-bottom:14px">Participants</div>
        <div style="background:#f9fafb;border-radius:12px;padding:14px 16px;border:1px solid #f3f4f6">
          ${participantRows}
        </div>
      </div>
    </div>

    <!-- Per person cards -->
    <div>
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;font-weight:700;margin-bottom:14px">Amount Per Person</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(165px,1fr));gap:12px">
        ${personCards}
      </div>
    </div>

  </div>

  <!-- Footer -->
  <div style="background:#f9fafb;padding:18px 40px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #f3f4f6">
    <img src="${logoUrl}" alt="Hootang" style="height:18px;opacity:0.18"/>
    <span style="font-size:11px;color:#d1d5db">Generated ${generatedOn}</span>
  </div>

</div>
<script>window.onload = () => window.print()</script>
</body>
</html>`

  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}
