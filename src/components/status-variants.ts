import { glyph } from "@kud/glyphs"
import { colors, symbols } from "../tokens.js"
import { getIconMode } from "../icon-mode.js"

export type StatusVariant = "success" | "error" | "warning" | "info"

// Unicode glyphs (the safe default — render on any terminal) and their Nerd Font
// counterparts from @kud/glyphs. Each variant is distinguished by shape, not
// colour, so status reads for colourblind users; colour only reinforces.
const UNICODE: Record<StatusVariant, string> = {
  success: symbols.success,
  error: symbols.error,
  warning: symbols.warn,
  info: symbols.info,
}

const NERD: Record<StatusVariant, string> = {
  success: glyph("check"),
  error: glyph("cross"),
  warning: glyph("warning"),
  info: glyph("info"),
}

const COLOR: Record<StatusVariant, string> = {
  success: colors.success,
  error: colors.error,
  warning: colors.warning,
  info: colors.info,
}

type ResolvedStatus = { icon: string; color: string }

// Resolved at render time so it honours the current icon mode.
export const statusVariant = (
  variant: StatusVariant,
): ResolvedStatus => ({
  icon: (getIconMode() === "nerd" ? NERD : UNICODE)[variant],
  color: COLOR[variant],
})
