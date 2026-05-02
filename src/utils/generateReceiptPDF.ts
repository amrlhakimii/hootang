import { type Receipt } from '../types/receipt'
import { calculateReceiptSplit } from './calculateSplit'
import { formatDate } from './formatDate'

export function generateReceiptPDF(receipt: Receipt) {
  const shares = calculateReceiptSplit(receipt)
  const subtotal = receipt.items.reduce((sum, i) => sum + i.price, 0)
  const taxAmt = subtotal * (receipt.tax / 100)
  const serviceAmt = subtotal * (receipt.serviceCharge / 100)
  const grandTotal = subtotal + taxAmt + serviceAmt
  const logoUrl = `${window.location.origin}/hootanglogo.png`
  const formattedDate = formatDate(receipt.date)
  const generatedOn = new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })

  const itemRows = receipt.items.map((item) => `
    <tr>
      <td>${item.name}${receipt.splitMode === 'itemized' && item.assignedTo.length > 0 ? `<div class="assigned">${item.assignedTo.join(', ')}</div>` : ''}</td>
      <td class="amount">RM ${item.price.toFixed(2)}</td>
    </tr>
  `).join('')

  const personCards = shares.map((share) => `
    <div class="person-card">
      <div class="person-name">${share.name}</div>
      <div class="person-amount">RM ${share.total.toFixed(2)}</div>
    </div>
  `).join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${receipt.title} — Hootang Receipt</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #222831;
      background: #fff;
      padding: 48px;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
    }
    .logo { height: 38px; }
    .invoice-badge { text-align: right; }
    .invoice-badge h1 {
      font-size: 30px;
      font-weight: 900;
      color: #00ADB5;
      letter-spacing: 4px;
    }
    .invoice-badge p { font-size: 12px; color: #aaa; margin-top: 3px; }

    /* Accent line */
    .accent-line {
      height: 3px;
      background: linear-gradient(90deg, #00ADB5 0%, rgba(0,173,181,0.1) 100%);
      border-radius: 2px;
      margin-bottom: 28px;
    }

    /* Receipt meta */
    .meta {
      display: flex;
      gap: 40px;
      margin-bottom: 32px;
    }
    .meta-item {}
    .meta-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #aaa;
      margin-bottom: 4px;
    }
    .meta-value { font-size: 15px; font-weight: 700; color: #222831; }

    /* Section label */
    .section-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #aaa;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #f0f0f0;
    }

    /* Items table */
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    thead th {
      text-align: left;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #aaa;
      padding: 8px 10px;
      border-bottom: 1px solid #e9ecef;
      font-weight: 600;
    }
    thead th.amount { text-align: right; }
    tbody td {
      padding: 10px;
      font-size: 13px;
      color: #333;
      border-bottom: 1px solid #f5f5f5;
      vertical-align: top;
    }
    td.amount { text-align: right; font-weight: 600; }
    .assigned { font-size: 11px; color: #bbb; margin-top: 3px; }

    /* Totals */
    .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 32px; }
    .totals { width: 240px; }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 13px;
      color: #666;
    }
    .totals-row.grand {
      border-top: 2px solid #e9ecef;
      margin-top: 6px;
      padding-top: 10px;
      font-size: 16px;
      font-weight: 800;
      color: #222831;
    }
    .totals-row.grand .total-amt { color: #00ADB5; }

    /* Per person */
    .person-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px;
      margin-bottom: 40px;
    }
    .person-card {
      border: 1.5px solid #c8f0f2;
      border-radius: 12px;
      padding: 14px 16px;
      background: #f4fcfd;
    }
    .person-name { font-size: 12px; font-weight: 600; color: #555; margin-bottom: 6px; }
    .person-amount { font-size: 22px; font-weight: 900; color: #00ADB5; }

    /* Footer */
    .footer {
      border-top: 1px solid #f0f0f0;
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer img { height: 20px; opacity: 0.25; }
    .footer-text { font-size: 11px; color: #ccc; }

    @media print {
      body { padding: 0; }
      @page { margin: 15mm 18mm; size: A4; }
    }
  </style>
</head>
<body>
  <div class="header">
    <img class="logo" src="${logoUrl}" alt="Hootang" />
    <div class="invoice-badge">
      <h1>RECEIPT</h1>
      <p>#${receipt.id.slice(0, 8).toUpperCase()}</p>
    </div>
  </div>

  <div class="accent-line"></div>

  <div class="meta">
    <div class="meta-item">
      <div class="meta-label">Receipt</div>
      <div class="meta-value">${receipt.title}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Date</div>
      <div class="meta-value">${formattedDate}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Split Mode</div>
      <div class="meta-value">${receipt.splitMode.charAt(0).toUpperCase() + receipt.splitMode.slice(1)}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Participants</div>
      <div class="meta-value">${receipt.participants.length} ${receipt.participants.length === 1 ? 'person' : 'people'}</div>
    </div>
  </div>

  <div class="section-label">Items</div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="amount">Amount</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div class="totals-wrap">
    <div class="totals">
      <div class="totals-row"><span>Subtotal</span><span>RM ${subtotal.toFixed(2)}</span></div>
      ${receipt.tax > 0 ? `<div class="totals-row"><span>Tax (${receipt.tax}%)</span><span>RM ${taxAmt.toFixed(2)}</span></div>` : ''}
      ${receipt.serviceCharge > 0 ? `<div class="totals-row"><span>Service (${receipt.serviceCharge}%)</span><span>RM ${serviceAmt.toFixed(2)}</span></div>` : ''}
      <div class="totals-row grand">
        <span>Grand Total</span>
        <span class="total-amt">RM ${grandTotal.toFixed(2)}</span>
      </div>
    </div>
  </div>

  <div class="section-label">Amount Per Person</div>
  <div class="person-grid">${personCards}</div>

  <div class="footer">
    <img src="${logoUrl}" alt="Hootang" />
    <div class="footer-text">Generated by Hootang &middot; ${generatedOn}</div>
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
