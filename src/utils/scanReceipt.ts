export interface ScannedReceipt {
  title: string
  items: { name: string; price: number; quantity: number }[]
  tax: number
  serviceCharge: number
  discount: number
}

export async function scanReceipt(imageBase64: string, mimeType: string): Promise<ScannedReceipt> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!apiKey) throw new Error('VITE_OPENROUTER_API_KEY is not set')

  const prompt = `You are a receipt scanner. Extract data from this receipt image and return ONLY valid JSON with no markdown or explanation:
{
  "title": "merchant or restaurant name (empty string if not found)",
  "items": [{ "name": "item name", "price": unit_price_as_number, "quantity": quantity_as_integer }],
  "tax": tax_percentage_as_number (e.g. 6 for 6%, 0 if not shown),
  "serviceCharge": service_charge_percentage_as_number (e.g. 10 for 10%, 0 if not shown),
  "discount": discount_amount_as_number in the receipt currency (0 if not shown)
}
Rules: price is the unit price (not total), quantity defaults to 1, all numbers must be valid JSON numbers not strings.`

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-exp:free',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `Request failed: ${response.status}`)
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('No response from model')

  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
