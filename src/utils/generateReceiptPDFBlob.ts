import { jsPDF } from 'jspdf'
import type { Receipt } from '../types/receipt'
import { calculateReceiptSplit } from './calculateSplit'
import { formatDate } from './formatDate'

const CARD_COLORS = [
  { bg: [255, 241, 238], name: [127, 29, 29], amount: [220, 38, 38] },
  { bg: [255, 251, 235], name: [120, 53, 15], amount: [217, 119, 6] },
  { bg: [240, 253, 244], name: [20, 83, 45], amount: [22, 163, 74] },
  { bg: [250, 245, 255], name: [76, 29, 149], amount: [124, 58, 237] },
  { bg: [239, 246, 255], name: [30, 58, 138], amount: [37, 99, 235] },
  { bg: [255, 241, 242], name: [136, 19, 55], amount: [225, 29, 72] },
] as const

export async function generateReceiptPDFBlob(receipt: Receipt): Promise<Blob> {
  const doc = new jsPDF({ format: 'a4', unit: 'mm', orientation: 'portrait' })
  const shares = calculateReceiptSplit(receipt)
  const rawSubtotal = receipt.items.reduce((sum, i) => sum + i.price * (i.quantity ?? 1), 0)
  const discountAmt = Math.min(receipt.discount ?? 0, rawSubtotal)
  const subtotal = rawSubtotal - discountAmt
  const taxAmt = subtotal * (receipt.tax / 100)
  const serviceAmt = subtotal * (receipt.serviceCharge / 100)
  const grandTotal = subtotal + taxAmt + serviceAmt
  const settledBy = receipt.settledBy ?? []

  const M = 15
  const W = 210
  const RW = W - M * 2
  let y = 0

  const checkPage = (needed = 10) => {
    if (y + needed > 280) { doc.addPage(); y = M }
  }

  // Header
  doc.setFillColor(26, 15, 0)
  doc.rect(0, 0, W, 55, 'F')

  const titleLines = doc.splitTextToSize(receipt.title, 120) as string[]
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(254, 250, 242)
  doc.text(titleLines, M, 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(180, 140, 100)
  doc.text(formatDate(receipt.date), M, 18 + titleLines.length * 7 + 3)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(251, 146, 60)
  doc.text(`RM ${grandTotal.toFixed(2)}`, W - M, 24, { align: 'right' })

  if (receipt.paidBy) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(180, 140, 100)
    doc.text(`Paid upfront by ${receipt.paidBy}`, M, 48)
  }

  y = 65

  // Items section
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(154, 123, 88)
  doc.text('ITEMS', M, y)
  y += 6

  doc.setFillColor(250, 245, 236)
  doc.rect(M, y, RW, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(154, 123, 88)
  doc.text('Description', M + 2, y + 5)
  doc.text('Qty', M + 95, y + 5, { align: 'center' })
  doc.text('Unit Price', M + 130, y + 5, { align: 'right' })
  doc.text('Total', W - M, y + 5, { align: 'right' })
  y += 7

  receipt.items.forEach((item, idx) => {
    const qty = item.quantity ?? 1
    const total = item.price * qty
    const nameLines = doc.splitTextToSize(item.name, 85) as string[]
    const rowH = Math.max(8, nameLines.length * 5 + 4)
    checkPage(rowH)
    if (idx % 2 !== 0) {
      doc.setFillColor(250, 245, 236)
      doc.rect(M, y, RW, rowH, 'F')
    }
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(61, 39, 16)
    doc.text(nameLines, M + 2, y + 5.5)
    doc.text(qty > 1 ? `${qty}` : '—', M + 95, y + 5.5, { align: 'center' })
    doc.text(`RM ${item.price.toFixed(2)}`, M + 130, y + 5.5, { align: 'right' })
    doc.text(`RM ${total.toFixed(2)}`, W - M, y + 5.5, { align: 'right' })
    y += rowH
  })

  y += 6
  checkPage(50)

  // Divider + Summary
  doc.setDrawColor(220, 201, 168)
  doc.setLineWidth(0.3)
  doc.line(M, y, W - M, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(154, 123, 88)
  doc.text('SUMMARY', M, y)
  y += 6

  const summaryRow = (
    label: string,
    value: string,
    color: readonly [number, number, number] = [120, 97, 74],
    bold = false,
  ) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(bold ? 10 : 9)
    doc.setTextColor(color[0], color[1], color[2])
    doc.text(label, W / 2, y)
    doc.text(value, W - M, y, { align: 'right' })
    y += 6
  }

  summaryRow('Subtotal', `RM ${rawSubtotal.toFixed(2)}`)
  if (discountAmt > 0) summaryRow('Discount', `−RM ${discountAmt.toFixed(2)}`, [22, 163, 74] as const)
  if (receipt.tax > 0) summaryRow(`Tax (${receipt.tax}%)`, `RM ${taxAmt.toFixed(2)}`)
  if (receipt.serviceCharge > 0) summaryRow(`Service (${receipt.serviceCharge}%)`, `RM ${serviceAmt.toFixed(2)}`)
  doc.setDrawColor(220, 201, 168)
  doc.line(W / 2, y - 2, W - M, y - 2)
  summaryRow('Grand Total', `RM ${grandTotal.toFixed(2)}`, [26, 15, 0] as const, true)

  y += 6
  checkPage(30)

  doc.setDrawColor(220, 201, 168)
  doc.line(M, y, W - M, y)
  y += 8

  // Per person section
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(154, 123, 88)
  doc.text('AMOUNT PER PERSON', M, y)
  y += 6

  const cardW = (RW - 6) / 2
  const cardH = 24

  for (let i = 0; i < shares.length; i += 2) {
    checkPage(cardH + 4)
    for (let col = 0; col < 2 && i + col < shares.length; col++) {
      const share = shares[i + col]
      const c = CARD_COLORS[(i + col) % CARD_COLORS.length]
      const x = M + col * (cardW + 6)

      doc.setFillColor(c.bg[0], c.bg[1], c.bg[2])
      doc.roundedRect(x, y, cardW, cardH, 2, 2, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(c.name[0], c.name[1], c.name[2])
      doc.text(share.name, x + 4, y + 8)

      const badge =
        receipt.paidBy === share.name
          ? 'PAID'
          : settledBy.includes(share.name)
            ? 'SETTLED'
            : null
      if (badge) {
        doc.setFontSize(7)
        doc.text(badge, x + cardW - 4, y + 8, { align: 'right' })
      }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.setTextColor(c.amount[0], c.amount[1], c.amount[2])
      doc.text(`RM ${share.total.toFixed(2)}`, x + 4, y + 17)

      if (receipt.paidBy && receipt.paidBy !== share.name) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(c.name[0], c.name[1], c.name[2])
        doc.text(`owes ${receipt.paidBy}`, x + 4, y + cardH - 3)
      }
    }
    y += cardH + 4
  }

  // Footer
  checkPage(15)
  y += 4
  doc.setDrawColor(220, 201, 168)
  doc.line(M, y, W - M, y)
  y += 7
  const generatedOn = new Date().toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(184, 149, 106)
  doc.text(`Generated by Hootang · ${generatedOn}`, W / 2, y, { align: 'center' })

  return doc.output('blob') as Blob
}
