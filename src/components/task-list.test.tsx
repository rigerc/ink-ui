import React from "react"
import {render} from "ink-testing-library"
import {describe, expect, it} from "vitest"
import {Task, TaskList} from "./task-list.js"

describe("TaskList", () => {
  it("shows accessible state glyphs and nested tasks", () => {
    const frame = render(
      <TaskList>
        <Task label="Build" state="running" animate={false}>
          <Task label="Compile" state="success"/>
          <Task label="Test" state="error"/>
        </Task>
        <Task label="Review" state="warning"/>
      </TaskList>
    ).lastFrame() ?? ""
    expect(frame).toContain("Build")
    expect(frame).toContain("✓ Compile")
    expect(frame).toContain("✗ Test")
    expect(frame).toContain("⚠ Review")
  })
  it("hides descendants when collapsed", () => {
    const frame = render(<Task label="Parent" expanded={false}><Task label="Hidden"/></Task>).lastFrame() ?? ""
    expect(frame).toContain("Parent")
    expect(frame).not.toContain("Hidden")
  })
  it("renders pending tasks without a success or failure verdict", () => {
    expect(render(<Task label="Queued"/>).lastFrame()).toContain("Queued")
  })
})
