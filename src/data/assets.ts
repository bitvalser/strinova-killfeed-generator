import type { KillType } from '../types'

export interface AssetOption {
  id: string
  label: string
  src: string
}

const characterModules = import.meta.glob('../../assets/characters/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const skillModules = import.meta.glob('../../assets/skill_icons/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

function basename(path: string): string {
  const parts = path.replace(/\\/g, '/').split('/')
  return parts[parts.length - 1] ?? path
}

function characterLabel(filename: string): string {
  return filename.replace(/\.png$/i, '').replace(/_/g, ' ')
}

function skillLabel(filename: string): string {
  return filename
    .replace(/\.png$/i, '')
    .replace(/^SPR_Dynamic_KillMessage_/, '')
}

function sortedOptions(
  modules: Record<string, string>,
  labelFn: (filename: string) => string,
): AssetOption[] {
  return Object.entries(modules)
    .map(([path, src]) => {
      const file = basename(path)
      const id = file.replace(/\.png$/i, '')
      return { id, label: labelFn(file), src }
    })
    .sort((a, b) => a.label.localeCompare(b.label))
}

export const characters: AssetOption[] = sortedOptions(
  characterModules,
  characterLabel,
)

export const skillIcons: AssetOption[] = sortedOptions(skillModules, skillLabel)

import headshotSrc from '../../assets/headshot.png'
import finalKillSrc from '../../assets/final_kill.png'
import knockbackSrc from '../../assets/knockback.png'
import borderSrc from '../../assets/border.png'
import leftBorderSrc from '../../assets/left_border.png'
import killFlagSrc from '../../assets/kill_flag.png'
import fontSrc from '../../assets/Calabiyau-Regular.ttf'

export const HEADSHOT_ID = 'headshot'
export const UTILITY_NONE_ID = ''
export const CUSTOM_ID = '__custom__'

/** Skill icons used as kill types instead of utility options */
const KILL_TYPE_SKILL_LABELS = new Set(['Falling', 'DangerArea'])

function findSkillByLabel(label: string): AssetOption | undefined {
  return skillIcons.find((s) => s.label === label)
}

export const utilityIcons: AssetOption[] = [
  { id: HEADSHOT_ID, label: 'Headshot', src: headshotSrc },
  ...skillIcons.filter((s) => !KILL_TYPE_SKILL_LABELS.has(s.label)),
]

const fallingSrc = findSkillByLabel('Falling')?.src ?? ''
const dangerSrc = findSkillByLabel('DangerArea')?.src ?? ''

export const killTypeIcons: Record<Exclude<KillType, 'empty'>, string> = {
  final: finalKillSrc,
  knockback: knockbackSrc,
  falling: fallingSrc,
  danger: dangerSrc,
}

export const killTypeOptions: { id: KillType; label: string }[] = [
  { id: 'final', label: 'Final' },
  { id: 'knockback', label: 'Knockback' },
  { id: 'falling', label: 'Falling' },
  { id: 'danger', label: 'Danger' },
  { id: 'empty', label: 'Empty' },
]

export const uiAssets = {
  border: borderSrc,
  leftBorder: leftBorderSrc,
  killFlag: killFlagSrc,
  font: fontSrc,
}

export function findCharacter(id: string): AssetOption | undefined {
  return characters.find((c) => c.id === id)
}

export function findUtilityIcon(id: string): AssetOption | undefined {
  if (!id || id === CUSTOM_ID) return undefined
  return utilityIcons.find((u) => u.id === id)
}

export function resolveCharacterSrc(
  characterId: string,
  customSrc: string | null,
): string | undefined {
  if (characterId === CUSTOM_ID) {
    return customSrc ?? findCharacter('Unknown')?.src
  }
  return findCharacter(characterId)?.src
}

export function resolveUtilitySrc(
  utilityId: string,
  customSrc: string | null,
): string | undefined {
  if (utilityId === CUSTOM_ID) return customSrc ?? undefined
  if (!utilityId) return undefined
  return findUtilityIcon(utilityId)?.src
}

export function resolveKillTypeSrc(killType: KillType): string | undefined {
  if (killType === 'empty') return undefined
  const src = killTypeIcons[killType]
  return src || undefined
}

export const defaultCharacter1 = characters.find((c) => c.id === 'Kokona')?.id
  ?? characters[0]?.id
  ?? ''

export const defaultCharacter2 = characters.find((c) => c.id === 'Michele')?.id
  ?? characters[1]?.id
  ?? characters[0]?.id
  ?? ''
