/**
 * Theme-level semantic roles, symbols and terminal rendering settings.
 * These complement the legacy static colors/palette/spacing exports.
 */
export const themeNames = ["dark", "light", "contrast", "mono"] as const
export type ThemeName = (typeof themeNames)[number]

export const tones = [
  "primary",
  "accent",
  "success",
  "warn",
  "danger",
  "info",
  "muted",
] as const
export type Tone = (typeof tones)[number]

export type BorderName = "round" | "single" | "bold" | "double" | "classic"

/** Optional values let monochrome themes avoid emitting color sequences. */
export type ThemePalette = Record<Tone, string | undefined> & {
  text: string | undefined
  subtle: string | undefined
  border: string | undefined
  focus: string | undefined
  onTone: string | undefined
}

export interface Symbols {
  success: string
  error: string
  warn: string
  info: string
  pointer: string
  checkboxChecked: string
  checkboxUnchecked: string
  bullet: string
  pending: string
  ellipsis: string
  line: string
  barFull: string
  barEmpty: string
}

export interface Theme {
  name: ThemeName | (string & {})
  mono: boolean
  color: ThemePalette
  border: { base: BorderName; focus: BorderName }
  symbols: Symbols
  motion: { spinner: readonly string[]; intervalMs: number }
}

export const unicodeSymbols: Symbols = {
  success: "✓",
  error: "✗",
  warn: "⚠",
  info: "ℹ",
  pointer: "❯",
  checkboxChecked: "◼",
  checkboxUnchecked: "◻",
  bullet: "•",
  pending: "○",
  ellipsis: "…",
  line: "─",
  barFull: "█",
  barEmpty: "░",
}

export const asciiSymbols: Symbols = {
  success: "+",
  error: "x",
  warn: "!",
  info: "i",
  pointer: ">",
  checkboxChecked: "[x]",
  checkboxUnchecked: "[ ]",
  bullet: "*",
  pending: "o",
  ellipsis: "...",
  line: "-",
  barFull: "#",
  barEmpty: "-",
}

export const unicodeSpinner = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
export const asciiSpinner = ["-", "\\", "|", "/"]
