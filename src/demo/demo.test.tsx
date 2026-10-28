import React from "react"
import { render } from "ink-testing-library"
import { describe, expect, it } from "vitest"
import { entries } from "./entries.js"
import { Gallery } from "./gallery.js"

const settle = () => new Promise((resolve) => setTimeout(resolve, 35))

const preview = (name: string, focused: boolean) => {
  const entry = entries.find((item) => item.name === name)
  if (!entry) throw new Error(`Missing demo entry: ${name}`)
  return <>{entry.render(focused)}</>
}

describe("interactive gallery demos", () => {
  it("includes a unique entry for Stepper and the expanded tokens", () => {
    expect(new Set(entries.map((entry) => entry.name)).size).toBe(entries.length)
    expect(entries.find((entry) => entry.name === "Stepper")?.interactive).toBe(true)
    expect(entries.find((entry) => entry.name === "Design tokens")?.interactive).toBe(true)
  })

  it("demonstrates validation, back, completion, cancellation and restart", async () => {
    const ui = render(preview("Stepper", true))
    expect(ui.lastFrame()).toContain("Details not ready")
    expect(ui.lastFrame()).toContain("Validation")

    ui.stdin.write("\r")
    await settle()
    expect(ui.lastFrame()).toContain("Details not ready")

    ui.stdin.write(" ")
    await settle()
    expect(ui.lastFrame()).toContain("Details ready")

    ui.stdin.write("\r")
    await settle()
    expect(ui.lastFrame()).toContain("Async validation passed")

    ui.stdin.write("b")
    await settle()
    expect(ui.lastFrame()).toContain("Details ready")

    ui.stdin.write("\r")
    await settle()
    ui.stdin.write("\r")
    await settle()
    expect(ui.lastFrame()).toContain("Ready to complete the wizard")

    ui.stdin.write("\r")
    await settle()
    expect(ui.lastFrame()).toContain("Wizard completed.")

    ui.stdin.write("r")
    await settle()
    expect(ui.lastFrame()).toContain("Details not ready")

    ui.stdin.write("b")
    await settle()
    expect(ui.lastFrame()).toContain("Wizard cancelled.")
  })

  it("can change Stepper progress to ASCII and vertical layout", async () => {
    const ui = render(preview("Stepper", true))
    expect(ui.lastFrame()).toContain("Unicode progress")
    expect(ui.lastFrame()).toContain("❯ 1. Details")

    ui.stdin.write("a")
    await settle()
    expect(ui.lastFrame()).toContain("ASCII progress")
    expect(ui.lastFrame()).toContain("> 1. Details")

    ui.stdin.write("v")
    await settle()
    expect(ui.lastFrame()).toContain("vertical layout")
  })

  it("shows Unicode/ASCII symbols and built-in borders in the token explorer", async () => {
    const ui = render(preview("Design tokens", true))
    expect(ui.lastFrame()).toContain("Semantic colors")
    expect(ui.lastFrame()).toContain("✓ success")
    expect(ui.lastFrame()).toContain("Borders")
    expect(ui.lastFrame()).toContain("Motion")

    ui.stdin.write("a")
    await settle()
    expect(ui.lastFrame()).toContain("Symbols · ASCII")
    expect(ui.lastFrame()).toContain("+ success")
    expect(ui.lastFrame()).toContain("> current")
  })

  it("keeps gallery Escape separate from the preview's own keys", async () => {
    const ui = render(<Gallery />)
    ui.stdin.write("k") // wrap to the last demo: Design tokens
    await settle()
    expect(ui.lastFrame()).toContain("Tokens")

    ui.stdin.write("\r")
    await settle()
    expect(ui.lastFrame()).toContain("focused")
    expect(ui.lastFrame()).toContain("ASCII / Unicode")

    ui.stdin.write("a")
    await settle()
    expect(ui.lastFrame()).toContain("Symbols · ASCII")

    ui.stdin.write("\u001B")
    await settle()
    expect(ui.lastFrame()).not.toContain("● focused")
    expect(ui.lastFrame()).toContain("⏎ to interact")
  })
})
