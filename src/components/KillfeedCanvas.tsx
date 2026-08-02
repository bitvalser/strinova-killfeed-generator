import { useCallback, useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Typography from '@mui/material/Typography'
import {
  drawKillfeed,
  ensureFontLoaded,
  loadImage,
  measureKillfeed,
  type KillfeedImages,
} from '../canvas/drawKillfeed'
import {
  resolveCharacterSrc,
  resolveKillTypeSrc,
  resolveUtilitySrc,
  uiAssets,
} from '../data/assets'
import type { KillfeedConfig } from '../types'

interface KillfeedCanvasProps {
  config: KillfeedConfig
}

const MIN_SCALE = 0.25
const MAX_SCALE = 4
const VIEW_HEIGHT = 360

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w\-]+/g, '_').replace(/_+/g, '_').slice(0, 40) || 'player'
}

async function loadKillfeedImages(cfg: KillfeedConfig): Promise<KillfeedImages | null> {
  const char1Src = resolveCharacterSrc(cfg.character1, cfg.customCharacter1)
  const char2Src = resolveCharacterSrc(cfg.character2, cfg.customCharacter2)
  const utilitySrc = resolveUtilitySrc(cfg.utilityIcon, cfg.customUtilityIcon)
  const killTypeSrc = resolveKillTypeSrc(cfg.killType)
  if (!char1Src || !char2Src) return null

  const [border, leftBorder, killFlag, character1, character2, utility, killType] =
    await Promise.all([
      loadImage(uiAssets.border),
      loadImage(uiAssets.leftBorder),
      loadImage(uiAssets.killFlag),
      loadImage(char1Src),
      loadImage(char2Src),
      utilitySrc ? loadImage(utilitySrc) : Promise.resolve(null),
      killTypeSrc ? loadImage(killTypeSrc) : Promise.resolve(null),
    ])

  return { border, leftBorder, killFlag, character1, character2, utility, killType }
}

export default function KillfeedCanvas({ config }: KillfeedCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 40, y: 40 })
  const configRef = useRef(config)
  const imagesRef = useRef<KillfeedImages | null>(null)
  const viewRef = useRef({ scale: 1, offset: { x: 40, y: 40 } })
  const viewSizeRef = useRef({ w: 0, h: 0 })
  const dragRef = useRef<{
    active: boolean
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)
  const rafRef = useRef(0)

  configRef.current = config
  viewRef.current = { scale, offset }

  useEffect(() => {
    let cancelled = false

    async function loadStatic() {
      try {
        const face = new FontFace('Calabiyau', `url(${uiAssets.font})`)
        const loaded = await face.load()
        document.fonts.add(loaded)
        await ensureFontLoaded()
        await Promise.all([
          loadImage(uiAssets.border),
          loadImage(uiAssets.leftBorder),
          loadImage(uiAssets.killFlag),
        ])
        if (cancelled) return
        setReady(true)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load assets')
        }
      }
    }

    void loadStatic()
    return () => {
      cancelled = true
    }
  }, [])

  const paint = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    const images = imagesRef.current
    if (!canvas || !container || !images || !ready) return

    const cfg = configRef.current
    const { scale: s, offset: o } = viewRef.current
    const dpr = window.devicePixelRatio || 1
    const cssW = Math.max(1, Math.floor(container.clientWidth))
    const cssH = Math.max(1, Math.floor(container.clientHeight))

    // Only reset the bitmap when the viewport size actually changes
    if (viewSizeRef.current.w !== cssW || viewSizeRef.current.h !== cssH) {
      viewSizeRef.current = { w: cssW, h: cssH }
      canvas.width = Math.ceil(cssW * dpr)
      canvas.height = Math.ceil(cssH * dpr)
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, cssW, cssH)

    ctx.save()
    ctx.translate(o.x, o.y)
    ctx.scale(s, s)
    drawKillfeed(ctx, cfg, images, 0, 0)
    ctx.restore()
  }, [ready])

  const schedulePaint = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => paint())
  }, [paint])

  const reloadAndPaint = useCallback(async () => {
    if (!ready) return
    try {
      const images = await loadKillfeedImages(configRef.current)
      if (!images) return
      imagesRef.current = images
      schedulePaint()
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Redraw failed')
    }
  }, [ready, schedulePaint])

  useEffect(() => {
    void reloadAndPaint()
  }, [config, reloadAndPaint])

  useEffect(() => {
    schedulePaint()
  }, [scale, offset, schedulePaint])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const ro = new ResizeObserver(() => {
      // Force bitmap resize check on next paint
      viewSizeRef.current = { w: 0, h: 0 }
      schedulePaint()
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [schedulePaint])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const { scale: prev, offset: prevOff } = viewRef.current
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev * factor))
      const wx = (mx - prevOff.x) / prev
      const wy = (my - prevOff.y) / prev
      setScale(next)
      setOffset({
        x: mx - wx * next,
        y: my - wy * next,
      })
    }

    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', onWheel)
  }, [ready])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.setPointerCapture(e.pointerId)
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: viewRef.current.offset.x,
      originY: viewRef.current.offset.y,
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current
    if (!drag?.active) return
    setOffset({
      x: drag.originX + (e.clientX - drag.startX),
      y: drag.originY + (e.clientY - drag.startY),
    })
  }

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current) dragRef.current.active = false
    canvasRef.current?.releasePointerCapture(e.pointerId)
  }

  const resetView = () => {
    setScale(1)
    setOffset({ x: 40, y: 40 })
  }

  const exportPng = useCallback(async () => {
    const cfg = configRef.current
    const images = await loadKillfeedImages(cfg)
    if (!images) return

    const offscreen = document.createElement('canvas')
    const ctx = offscreen.getContext('2d')
    if (!ctx) return

    ctx.font = `18px Calabiyau`
    const hasUtility = !!resolveUtilitySrc(cfg.utilityIcon, cfg.customUtilityIcon)
    const hasKillType = cfg.killType !== 'empty'
    const metrics = measureKillfeed(ctx, cfg, hasUtility, hasKillType)
    const exportScale = 2
    offscreen.width = Math.ceil(metrics.totalW * exportScale)
    offscreen.height = Math.ceil(metrics.totalH * exportScale)
    ctx.setTransform(exportScale, 0, 0, exportScale, 0, 0)
    ctx.clearRect(0, 0, metrics.totalW, metrics.totalH)
    drawKillfeed(ctx, cfg, images, 0, 0)

    offscreen.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `killfeed-${sanitizeFilename(cfg.nickname1)}-${sanitizeFilename(cfg.nickname2)}.png`
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }, [])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        flex: 1,
        minWidth: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Preview
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Drag to move · Scroll to zoom · {Math.round(scale * 100)}%
        </Typography>
      </Box>
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          width: '100%',
          height: VIEW_HEIGHT,
          flexShrink: 0,
          background:
            'repeating-conic-gradient(#cfd8e3 0% 25%, #e4eaf1 0% 50%) 50% / 16px 16px',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' },
        }}
      >
        {error ? (
          <Typography color="error" sx={{ p: 2 }}>
            {error}
          </Typography>
        ) : (
          <canvas
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              display: 'block',
              touchAction: 'none',
            }}
          />
        )}
      </Box>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          onClick={() => void exportPng()}
          disabled={!ready || !!error}
        >
          Export PNG
        </Button>
        <ButtonGroup size="small" variant="outlined">
          <Button onClick={() => setScale((s) => Math.min(MAX_SCALE, s * 1.25))}>
            Zoom +
          </Button>
          <Button onClick={() => setScale((s) => Math.max(MIN_SCALE, s / 1.25))}>
            Zoom −
          </Button>
          <Button onClick={resetView}>Reset view</Button>
        </ButtonGroup>
      </Box>
    </Box>
  )
}
