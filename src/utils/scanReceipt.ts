export interface ScannedReceipt {
  title: string
  items: { name: string; price: number; quantity: number }[]
  tax: number
  serviceCharge: number
  discount: number
}

export async function scanReceipt(imageBase64: string, mimeType: string): Promise<ScannedReceipt> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent`

  const prompt = `You are a receipt scanner. Extract data from this receipt image and return ONLY valid JSON with no markdown or explanation:
{
  "title": "merchant or restaurant name (empty string if not found)",
  "items": [{ "name": "item name", "price": unit_price_as_number, "quantity": quantity_as_integer }],
  "tax": tax_percentage_as_number (e.g. 6 for 6%, 0 if not shown),
  "serviceCharge": service_charge_percentage_as_number (e.g. 10 for 10%, 0 if not shown),
  "discount": discount_amount_as_number in the receipt currency (0 if not shown)
}
Rules: price is the unit price (not total), quantity defaults to 1, all numbers must be valid JSON numbers not strings.`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [
        { text: prompt },
        { inline_data: { mime_type: mimeType, data: imageBase64 } },
      ]}],
      generationConfig: { response_mime_type: 'application/json' },
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? 'Failed to scan receipt')
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('No response from Gemini')
  return JSON.parse(text)
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
