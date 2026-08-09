export default function isColorDark(colorSrc: string): boolean {
  if (!colorSrc) return false

  let color = colorSrc.replace('#', '')
  if (color.length === 3) {
    color = color.split('').map(char => char + char).join('')
  }

  if (color.length !== 6) return false

  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)

  if (isNaN(r) || isNaN(g) || isNaN(b)) return false

  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness < 128
}