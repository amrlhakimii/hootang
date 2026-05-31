export function shareWhatsApp(text: string) {
  if (navigator.share) {
    navigator.share({ text }).catch(() => {})
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }
}
