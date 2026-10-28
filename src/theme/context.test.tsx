import React from "react"
import { Text } from "ink"
import { render } from "ink-testing-library"
import { afterEach, describe, expect, it } from "vitest"
import { ThemeProvider, useTheme } from "./context.js"
import { themes } from "./themes.js"

const Probe = () => {
  const theme = useTheme()
  return (
    <Text>
      {theme.name} {theme.symbols.pointer} {theme.mono ? "mono" : "color"}
    </Text>
  )
}

afterEach(() => {
  delete process.env["NO_COLOR"]
})

describe("ThemeProvider", () => {
  it("uses existing dark tokens by default", () => {
    expect(render(<Probe />).lastFrame()).toContain("dark ❯ color")
  })

  it("selects a named theme and ASCII glyphs", () => {
    const { lastFrame } = render(
      <ThemeProvider theme="light" ascii>
        <Probe />
      </ThemeProvider>,
    )
    expect(lastFrame()).toContain("light > color")
  })

  it("supports a custom theme object", () => {
    const custom = { ...themes.dark, name: "custom", symbols: { ...themes.dark.symbols, pointer: "#" } }
    expect(
      render(<ThemeProvider theme={custom}><Probe /></ThemeProvider>).lastFrame(),
    ).toContain("custom # color")
  })

  it("honors NO_COLOR over a requested color theme", () => {
    process.env["NO_COLOR"] = "1"
    expect(
      render(<ThemeProvider theme="light"><Probe /></ThemeProvider>).lastFrame(),
    ).toContain("mono ❯ mono")
  })
})
