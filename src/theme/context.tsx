import React, { createContext, useContext, useMemo, type ReactNode } from "react"
import { applyAscii, themes } from "./themes.js"
import type { Theme, ThemeName, Tone } from "./tokens.js"

const Context = createContext<Theme | null>(null)

export interface ThemeProviderProps {
  /** Built-in theme name or a complete custom theme. Defaults to dark. */
  theme?: ThemeName | Theme
  /** Use ASCII symbols and borders for limited terminals. */
  ascii?: boolean
  children: ReactNode
}

/**
 * Only components using useTheme adopt provider-selected tokens.
 * NO_COLOR always selects monochrome, including without a provider.
 */
export const ThemeProvider = ({
  theme = "dark",
  ascii = false,
  children,
}: ThemeProviderProps) => {
  const resolved = useMemo(() => {
    const base =
      process.env["NO_COLOR"] !== undefined
        ? themes.mono
        : typeof theme === "string"
          ? themes[theme]
          : theme

    return ascii ? applyAscii(base) : base
  }, [theme, ascii])

  return <Context.Provider value={resolved}>{children}</Context.Provider>
}

export const useTheme = (): Theme =>
  useContext(Context) ??
  (process.env["NO_COLOR"] !== undefined ? themes.mono : themes.dark)

export const useTone = (tone: Tone) => {
  const theme = useTheme()
  return { color: theme.color[tone], dimColor: theme.mono && tone === "muted" }
}
