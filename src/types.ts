export type Side = 'enemy' | 'ally'

export type NicknameRole = Side | 'you'

export type KillType = 'final' | 'knockback' | 'falling' | 'danger' | 'empty'

export interface KillfeedConfig {
  side: Side
  killCount: number
  character1: string
  nickname1: string
  player1You: boolean
  character2: string
  nickname2: string
  player2You: boolean
  /** Empty string means no utility icon */
  utilityIcon: string
  killType: KillType
  customCharacter1: string | null
  customCharacter2: string | null
  customUtilityIcon: string | null
}

export const ROLE_COLORS: Record<NicknameRole, string> = {
  ally: 'rgb(154, 194, 229)',
  enemy: 'rgb(241, 159, 129)',
  you: 'rgb(254, 204, 70)',
}

export function oppositeSide(side: Side): Side {
  return side === 'ally' ? 'enemy' : 'ally'
}

/** Nickname color: You checkbox wins; else killer uses Side, victim uses opposite. */
export function nicknameColor(
  side: Side,
  isYou: boolean,
  isKiller: boolean,
): string {
  if (isYou) return ROLE_COLORS.you
  return ROLE_COLORS[isKiller ? side : oppositeSide(side)]
}

export const ROMAN_NUMERALS: Record<number, string> = {
  2: '\u2161',
  3: '\u2162',
  4: '\u2163',
  5: '\u2164',
  6: '\u2165',
}
