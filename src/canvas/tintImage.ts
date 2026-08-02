const tintCache = new Map<string, HTMLCanvasElement>()

/**
 * Tint a grayscale/white sprite by filling with color and masking with the image alpha.
 */
export function tintImage(
  image: HTMLImageElement | HTMLCanvasElement | ImageBitmap,
  color: string,
): HTMLCanvasElement {
  const key = `${
    image instanceof HTMLImageElement ? image.src : 'bitmap'
  }:${color}:${image.width}x${image.height}`

  const cached = tintCache.get(key)
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  ctx.fillStyle = color
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.globalCompositeOperation = 'destination-in'
  ctx.drawImage(image, 0, 0)

  tintCache.set(key, canvas)
  return canvas
}
