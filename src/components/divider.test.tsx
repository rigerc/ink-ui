import React from "react"
import {render} from "ink-testing-library"
import {describe, expect, it} from "vitest"
import {Divider, dividerLine} from "./divider.js"

describe("Divider", () => {
  it("draws an exact-width rule", () => {
    expect(dividerLine(6, "", "-")).toBe("------")
    expect(render(<Divider width={6} character="-"/>).lastFrame()).toBe("------")
  })
  it("reserves cells for its label", () => {
    expect(dividerLine(10, "Files", "-")).toBe(" Files ---")
  })
  it("handles zero and narrow widths", () => {
    expect(dividerLine(0, "Test")).toBe("")
    expect(dividerLine(3, "Long", "-")).toHaveLength(3)
  })
  it("falls back from double-width rule glyphs", () => {
    expect(dividerLine(4, "", "界")).toHaveLength(4)
  })
})
