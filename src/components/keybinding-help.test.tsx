import React from "react"
import {render} from "ink-testing-library"
import {describe, expect, it} from "vitest"
import {KeybindingHelp} from "./keybinding-help.js"

const groups = [
  {title: "Navigation", bindings: [["j/k", "move"], ["Enter", "open"]] as [string,string][]},
  {title: "Actions", bindings: [["r", "reload"]] as [string,string][]},
]

describe("KeybindingHelp", () => {
  it("shows grouped keyboard hints without requiring input handlers", () => {
    const frame = render(<KeybindingHelp groups={groups} columns={1}/>).lastFrame() ?? ""
    expect(frame).toContain("Navigation")
    expect(frame).toContain("Actions")
    expect(frame).toContain("Enter")
    expect(frame).toContain("reload")
  })
  it("renders nothing when hidden", () => {
    expect(render(<KeybindingHelp groups={groups} visible={false}/>).lastFrame()).toBe("")
  })
  it("supports multiple columns", () => {
    const frame = render(<KeybindingHelp groups={groups} columns={2} width={60}/>).lastFrame() ?? ""
    expect(frame).toContain("Navigation")
    expect(frame).toContain("Actions")
  })
})
