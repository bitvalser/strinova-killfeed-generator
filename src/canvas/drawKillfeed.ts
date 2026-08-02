import { drawNineSlice, drawLeftBorderNineSlice } from "./nineSlice";
import { tintImage } from "./tintImage";
import {
  KillfeedConfig,
  ROLE_COLORS,
  ROMAN_NUMERALS,
  nicknameColor,
} from "../types";

export const FONT_FAMILY = "Calabiyau";

export interface KillfeedImages {
  border: HTMLImageElement;
  leftBorder: HTMLImageElement;
  killFlag: HTMLImageElement;
  character1: HTMLImageElement;
  character2: HTMLImageElement;
  utility: HTMLImageElement | null;
  killType: HTMLImageElement | null;
}

export interface DrawResult {
  width: number;
  height: number;
}

const PAD_LEFT = 22;
const PAD_RIGHT = 10;
const GAP = 12;
const ICON_GAP = 6;
const ICON_HEIGHT_RATIO = 0.95;
const FLAG_W = 32;
const FLAG_GAP = 0;
const FLAG_HEIGHT_RATIO = 0.66;
const BOX_MIN_H = 56;
const FONT_SIZE = 26;
const FLAG_FONT_SIZE = 22;
const BORDER_SLICE = 4;

function iconSizeForBox(boxH: number): number {
  return boxH * ICON_HEIGHT_RATIO;
}

function iconsBlockWidth(
  hasUtility: boolean,
  hasKillType: boolean,
  boxH: number
): number {
  const size = iconSizeForBox(boxH);
  let count = 0;
  if (hasUtility) count++;
  if (hasKillType) count++;
  if (count === 0) return 0;
  return count * size + (count - 1) * ICON_GAP + GAP;
}

export function measureKillfeed(
  ctx: CanvasRenderingContext2D,
  config: KillfeedConfig,
  hasUtility: boolean,
  hasKillType: boolean
): {
  boxW: number;
  boxH: number;
  totalW: number;
  totalH: number;
  showFlag: boolean;
} {
  ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
  const nick1W = Math.max(20, ctx.measureText(config.nickname1 || " ").width);
  const nick2W = Math.max(20, ctx.measureText(config.nickname2 || " ").width);
  const boxH = BOX_MIN_H;
  const charSize = boxH;

  const contentW =
    PAD_LEFT +
    charSize +
    GAP +
    nick1W +
    GAP +
    iconsBlockWidth(hasUtility, hasKillType, boxH) +
    nick2W +
    GAP +
    charSize +
    PAD_RIGHT;

  const showFlag = config.killCount >= 2;
  const totalW = (showFlag ? FLAG_W + FLAG_GAP : 0) + contentW;
  const totalH = boxH;

  return { boxW: contentW, boxH, totalW, totalH, showFlag };
}

export function drawKillfeed(
  ctx: CanvasRenderingContext2D,
  config: KillfeedConfig,
  images: KillfeedImages,
  originX = 0,
  originY = 0
): DrawResult {
  const hasUtility = !!images.utility;
  const hasKillType = !!images.killType;
  const metrics = measureKillfeed(ctx, config, hasUtility, hasKillType);
  const { boxW, boxH, totalW, totalH, showFlag } = metrics;

  const killerColor = nicknameColor(config.side, config.player1You, true);
  const victimColor = nicknameColor(config.side, config.player2You, false);
  const flagColor = ROLE_COLORS[config.side];

  let boxX = originX;
  const boxY = originY;
  const charSize = boxH;

  if (showFlag) {
    const flagH = boxH * FLAG_HEIGHT_RATIO;
    const tinted = tintImage(images.killFlag, flagColor);
    ctx.drawImage(tinted, originX, boxY, FLAG_W, flagH);

    const roman = ROMAN_NUMERALS[config.killCount] ?? "";
    ctx.font = `${FLAG_FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(roman, originX + FLAG_W / 2, boxY + flagH / 2 - 3);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    boxX = originX + FLAG_W + FLAG_GAP;
  }

  // Fill / top / bottom from border.png (skip low-quality left + right)
  drawNineSlice(
    ctx,
    images.border,
    boxX,
    boxY,
    boxW,
    boxH,
    BORDER_SLICE,
    true,
    true
  );
  // HQ left edge via 9-slice on left_border.png only
  drawLeftBorderNineSlice(ctx, images.leftBorder, boxX, boxY, boxH);
  drawLeftBorderNineSlice(ctx, images.leftBorder, boxX, boxY, boxH);

  let cx = boxX + PAD_LEFT;
  const midY = boxY + boxH / 2;
  const iconSize = iconSizeForBox(boxH);

  ctx.drawImage(images.character1, cx, boxY, charSize, charSize);
  cx += charSize + GAP;

  ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = killerColor;
  ctx.textBaseline = "middle";
  ctx.fillText(config.nickname1, cx, midY);
  cx += ctx.measureText(config.nickname1 || " ").width + GAP;

  if (images.utility) {
    ctx.drawImage(
      tintImage(images.utility, "#FFFFFF"),
      cx,
      midY - iconSize / 2,
      iconSize,
      iconSize
    );
    cx += iconSize;
    if (images.killType) {
      cx += ICON_GAP;
    }
  }

  if (images.killType) {
    ctx.drawImage(
      tintImage(images.killType, "#FFFFFF"),
      cx,
      midY - iconSize / 2,
      iconSize,
      iconSize
    );
    cx += iconSize;
  }

  if (images.utility || images.killType) {
    cx += GAP;
  }

  ctx.fillStyle = victimColor;
  ctx.fillText(config.nickname2, cx, midY);
  cx += ctx.measureText(config.nickname2 || " ").width + GAP;

  ctx.drawImage(images.character2, cx, boxY, charSize, charSize);

  return { width: totalW, height: totalH };
}

const imageCache = new Map<string, Promise<HTMLImageElement>>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached) return cached;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      imageCache.delete(src);
      reject(new Error(`Failed to load image: ${src}`));
    };
    img.src = src;
  });
  imageCache.set(src, promise);
  return promise;
}

export async function ensureFontLoaded(): Promise<void> {
  if (document.fonts?.check(`12px ${FONT_FAMILY}`)) {
    await document.fonts.load(`16px ${FONT_FAMILY}`);
  } else {
    await document.fonts.ready;
    await document.fonts.load(`16px ${FONT_FAMILY}`);
  }
}
