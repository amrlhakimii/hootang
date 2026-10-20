import { type Receipt } from '../types/receipt'
import { type Profile } from '../types/profile'

import jsQR from 'jsqr'
import QRCode from 'qrcode'

const MAX_SCAN_SIDE = 1600
const MAX_RAW_SIDE = 640
const MAX_BYTES = 600_000 // keep well under Firestore's 1 MB document limit

export const NO_QR_FOUND = 'NO_QR_FOUND'

const QR_DARK = '#222831' // app dark
const QR_TEAL = '#00838B' // app teal, darkened so it still scans reliably
const QR_PX = 640
const QUIET_ZONE = 2 // modules

/** Draw a QR in the app's colours: dark modules with teal corner markers, on white. */
export async function renderQrImage(payload: string): Promise<string> {
  const { modules } = QRCode.create(payload, { errorCorrectionLevel: 'M' })
  const n = modules.size
  const total = n + QUIET_ZONE * 2
  const cell = Math.floor(QR_PX / total)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = cell * total
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  const inFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7)
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!modules.get(r, c)) continue
      ctx.fillStyle = inFinder(r, c) ? QR_TEAL : QR_DARK
      ctx.fillRect((c + QUIET_ZONE) * cell, (r + QUIET_ZONE) * cell, cell, cell)
    }
  }
  return canvas.toDataURL('image/png')
}

/** Show the user's QR only when the receipt was paid by the user themselves. */
export function getReceiptQr(receipt: Pick<Receipt, 'paidBy'>, profile: Profile): string | undefined {
  const me = profile.myName?.trim().toLowerCase()
  if (!profile.duitnowQr || !me) return undefined
  return receipt.paidBy?.trim().toLowerCase() === me ? profile.duitnowQr : undefined
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that image'))
    }
    img.src = url
  })
}

function drawToCanvas(img: HTMLImageElement, maxSide: number): HTMLCanvasElement {
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas
}

/**
 * Find the QR inside an uploaded image (e.g. a full banking-app screenshot) and return its
 * content, to be re-rendered as a clean QR-only image. Throws NO_QR_FOUND if none is detected.
 */
export async function extractQrPayload(file: File): Promise<string> {
  const img = await loadImage(file)
  const canvas = drawToCanvas(img, MAX_SCAN_SIDE)
  const ctx = canvas.getContext('2d')!
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const code = jsQR(data, width, height, { inversionAttempts: 'attemptBoth' })
  if (!code || !code.data) throw new Error(NO_QR_FOUND)
  return code.data
}

/** Fallback: keep the image as uploaded (downscaled), for when no QR could be detected. */
export async function imageFileToDataUrl(file: File): Promise<string> {
  const canvas = drawToCanvas(await loadImage(file), MAX_RAW_SIDE)
  let out = canvas.toDataURL('image/png')
  if (out.length > MAX_BYTES) out = canvas.toDataURL('image/jpeg', 0.92)
  if (out.length > MAX_BYTES) throw new Error('Image is too large')
  return out
}
