import { colors, palette } from "../tokens.js"
import {
  asciiSpinner,
  asciiSymbols,
  unicodeSpinner,
  unicodeSymbols,
  type Theme,
  type ThemeName,
  type ThemePalette,
} from "./tokens.js"

const makeTheme = (
  name: ThemeName,
  color: ThemePalette,
  overrides: Partial<Theme> = {},
): Theme => ({
  name,
  mono: false,
  color,
  border: { base: "round", focus: "bold" },
  symbols: unicodeSymbols,
  motion: { spinner: unicodeSpinner, intervalMs: 80 },
  ...overrides,
})

const dark = makeTheme("dark", {
  primary: colors.accent,
  accent: colors.link,
  success: colors.success,
  warn: colors.warning,
  danger: colors.error,
  info: colors.info,
  muted: colors.muted,
  text: palette.ink,
  subtle: colors.secondary,
  border: colors.dim,
  focus: colors.accent,
  onTone: palette.ground,
})

const light = makeTheme("light", {
  primary: "#AD4D00",
  accent: "#1556B8",
  success: "#126B40",
  warn: "#8B5600",
  danger: "#B42333",
  info: "#006D8F",
  muted: "#586174",
  text: "#17202D",
  subtle: "#445167",
  border: "#6A7282",
  focus: "#AD4D00",
  onTone: "#FFFFFF",
})

/** ANSI colors let the terminal palette determine the high-contrast hues. */
const contrast = makeTheme("contrast", {
  primary: "yellowBright",
  accent: "cyanBright",
  success: "greenBright",
  warn: "yellow",
  danger: "redBright",
  info: "blueBright",
  muted: "white",
  text: "whiteBright",
  subtle: "white",
  border: "white",
  focus: "yellowBright",
  onTone: "black",
})

const noColor: ThemePalette = {
  primary: undefined,
  accent: undefined,
  success: undefined,
  warn: undefined,
  danger: undefined,
  info: undefined,
  muted: undefined,
  text: undefined,
  subtle: undefined,
  border: undefined,
  focus: undefined,
  onTone: undefined,
}

const mono = makeTheme("mono", noColor, {
  mono: true,
  border: { base: "single", focus: "double" },
})

export const themes: Record<ThemeName, Theme> = { dark, light, contrast, mono }

/** Adapt glyphs, borders and animation together for ASCII-only terminals. */
export const applyAscii = (theme: Theme): Theme => ({
  ...theme,
  border: { base: "classic", focus: "classic" },
  symbols: asciiSymbols,
  motion: { ...theme.motion, spinner: asciiSpinner },
})
