import React from "react"
import {Text} from "ink"
import {colors} from "../tokens.js"

type LinkProps = {
  url: string
  children: React.ReactNode
  /** Non-hyperlink terminals show the URL after the label by default. */
  fallback?: "url" | "label"
  /** Override terminal feature detection, for example in tests. */
  hyperlinks?: boolean
}

const withoutControls = (value: string): string => {
  let output = ""

  for (const char of value) {
    const code = char.charCodeAt(0)

    if (code >= 32 && code !== 127) output += char
  }

  return output
}

const isSafeUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)

    return (parsed.protocol === "https:" || parsed.protocol === "http:" || parsed.protocol === "mailto:") &&
      withoutControls(url) === url
  } catch {
    return false
  }
}

export const supportsHyperlinks = (
  env: NodeJS.ProcessEnv = process.env,
  isTTY: boolean = Boolean(process.stdout.isTTY),
): boolean => {
  if (env.FORCE_HYPERLINK === "0" || env.NO_HYPERLINK === "1") return false

  if (env.FORCE_HYPERLINK === "1") return true

  if (!isTTY || env.TERM === "dumb") return false

  return Boolean(
    env.WT_SESSION ||
    env.KITTY_WINDOW_ID ||
    env.WEZTERM_PANE ||
    env.ITERM_SESSION_ID ||
    env.TERM_PROGRAM === "iTerm.app" ||
    env.TERM_PROGRAM === "WezTerm" ||
    (env.VTE_VERSION && Number(env.VTE_VERSION) >= 5000)
  )
}

/** OSC 8 hyperlink on capable terminals, a readable URL everywhere else. */
export const Link = ({
  url,
  children,
  fallback = "url",
  hyperlinks,
}: LinkProps) => {
  const visibleUrl = withoutControls(url)
  const valid = isSafeUrl(url)
  const active = valid && (hyperlinks ?? supportsHyperlinks())
  const open = "\u001b]8;;" + url + "\u001b\\"
  const close = "\u001b]8;;\u001b\\"

  return (
    <Text color={colors.link} underline>
      {active ? <>{open}{children}{close}</> : children}
      {!active && fallback === "url" && url ? <Text dimColor>{" (" + visibleUrl + ")"}</Text> : null}
    </Text>
  )
}
