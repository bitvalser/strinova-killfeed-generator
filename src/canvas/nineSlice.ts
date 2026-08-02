export interface SourceRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

/**
 * Draw a 9-slice scaled image into a destination rect.
 * Source corners use `slice` (clamped to half the source). Destination corners
 * use `destSlice` when provided, otherwise the same pixel size as the source edge
 * (classic UI 9-slice for small textures like border.png).
 */
export function drawNineSlice(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  slice: number,
  omitRightEdge = false,
  omitLeftEdge = false,
  source?: SourceRect,
  destSlice?: number
): void {
  const full = imageSize(image);
  const sx0 = source?.sx ?? 0;
  const sy0 = source?.sy ?? 0;
  const iw = source?.sw ?? full.w;
  const ih = source?.sh ?? full.h;

  const srcEdge = Math.min(slice, Math.floor(iw / 2), Math.floor(ih / 2));
  const dstEdge = Math.min(
    destSlice ?? srcEdge,
    Math.floor(dw / 2),
    Math.floor(dh / 2)
  );

  const midSrcX = sx0 + srcEdge;
  const midSrcWidth = Math.max(1, iw - srcEdge * 2);
  const midSH = Math.max(1, ih - srcEdge * 2);

  const dstLW = omitLeftEdge ? 0 : dstEdge;
  const dstRW = omitRightEdge ? 0 : dstEdge;
  const midDW = Math.max(0, dw - dstLW - dstRW);
  const midDH = Math.max(0, dh - dstEdge * 2);

  if (!omitLeftEdge) {
    ctx.drawImage(image, sx0, sy0, srcEdge, srcEdge, dx, dy, dstEdge, dstEdge);
  }
  if (midDW > 0) {
    ctx.drawImage(
      image,
      midSrcX,
      sy0,
      midSrcWidth,
      srcEdge,
      dx + dstLW,
      dy,
      midDW,
      dstEdge
    );
  }
  if (!omitRightEdge) {
    ctx.drawImage(
      image,
      sx0 + iw - srcEdge,
      sy0,
      srcEdge,
      srcEdge,
      dx + dw - dstEdge,
      dy,
      dstEdge,
      dstEdge
    );
  }

  if (!omitLeftEdge && midDH > 0) {
    ctx.drawImage(
      image,
      sx0,
      sy0 + srcEdge,
      srcEdge,
      midSH,
      dx,
      dy + dstEdge,
      dstEdge,
      midDH
    );
  }
  if (midDW > 0 && midDH > 0) {
    ctx.drawImage(
      image,
      midSrcX,
      sy0 + srcEdge,
      midSrcWidth,
      midSH,
      dx + dstLW,
      dy + dstEdge,
      midDW,
      midDH
    );
  }
  if (!omitRightEdge && midDH > 0) {
    ctx.drawImage(
      image,
      sx0 + iw - srcEdge,
      sy0 + srcEdge,
      srcEdge,
      midSH,
      dx + dw - dstEdge,
      dy + dstEdge,
      dstEdge,
      midDH
    );
  }

  if (!omitLeftEdge) {
    ctx.drawImage(
      image,
      sx0,
      sy0 + ih - srcEdge,
      srcEdge,
      srcEdge,
      dx,
      dy + dh - dstEdge,
      dstEdge,
      dstEdge
    );
  }
  if (midDW > 0) {
    ctx.drawImage(
      image,
      midSrcX,
      sy0 + ih - srcEdge,
      midSrcWidth,
      srcEdge,
      dx + dstLW,
      dy + dh - dstEdge,
      midDW,
      dstEdge
    );
  }
  if (!omitRightEdge) {
    ctx.drawImage(
      image,
      sx0 + iw - srcEdge,
      sy0 + ih - srcEdge,
      srcEdge,
      srcEdge,
      dx + dw - dstEdge,
      dy + dh - dstEdge,
      dstEdge,
      dstEdge
    );
  }
}

/**
 * 9-slice the HQ left_border asset into a strip flush with the box
 * (left 0, top 0, bottom 0). Transparent padding is trimmed first.
 */
export function drawLeftBorderNineSlice(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  dx: number,
  dy: number,
  dh: number
): number {
  const bounds = getOpaqueBounds(image);
  const dw = 3;
  // Top/bottom caps ≈ square relative to strip width
  const srcSlice = Math.max(1, Math.floor(bounds.sw / 2));
  const destSlice = Math.max(1, Math.round(srcSlice * (dh / bounds.sh)));
  drawNineSlice(
    ctx,
    image,
    dx,
    dy,
    dw,
    dh,
    srcSlice,
    false,
    false,
    bounds,
    destSlice
  );
  return dw;
}

function imageSize(image: CanvasImageSource): { w: number; h: number } {
  const w =
    image instanceof HTMLImageElement || image instanceof HTMLCanvasElement
      ? image.width
      : (image as ImageBitmap).width;
  const h =
    image instanceof HTMLImageElement || image instanceof HTMLCanvasElement
      ? image.height
      : (image as ImageBitmap).height;
  return { w, h };
}

const contentBoundsCache = new WeakMap<
  CanvasImageSource,
  { sx: number; sy: number; sw: number; sh: number }
>();

/** Opaque content bounds (trims transparent padding in HQ border assets). */
export function getOpaqueBounds(image: CanvasImageSource): {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
} {
  const cached = contentBoundsCache.get(image);
  if (cached) return cached;

  const { w, h } = imageSize(image);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    const full = { sx: 0, sy: 0, sw: w, sh: h };
    contentBoundsCache.set(image, full);
    return full;
  }
  ctx.drawImage(image, 0, 0);
  const data = ctx.getImageData(0, 0, w, h).data;

  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * 4 + 3];
      if (a > 10) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  const bounds =
    maxX >= minX && maxY >= minY
      ? { sx: minX, sy: minY, sw: maxX - minX + 1, sh: maxY - minY + 1 }
      : { sx: 0, sy: 0, sw: w, sh: h };

  contentBoundsCache.set(image, bounds);
  return bounds;
}
