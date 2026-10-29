import React from "react"
import { render } from "ink-testing-library"
import { describe, it, expect } from "vitest"
import { Table } from "./table.js"

const lines = (frame: string | undefined) => (frame ?? "").split("\n")

describe("Table", () => {
  it("renders headers above their rows", () => {
    const { lastFrame } = render(
      <Table
        maxWidth={40}
        columns={[
          { key: "name", header: "Name" },
          { key: "status", header: "Status" },
        ]}
        data={[{ name: "api", status: "ok" }]}
      />,
    )

    const [header, row] = lines(lastFrame())
    expect(header).toContain("Name")
    expect(header).toContain("Status")
    expect(row).toContain("api")
    expect(row).toContain("ok")
  })

  it("wraps a cell whose column asks for it, keeping it inside its width", () => {
    const { lastFrame } = render(
      <Table
        maxWidth={40}
        columns={[
          { key: "program", header: "Program", width: 10, overflow: "wrap" },
        ]}
        data={[{ program: "alpha bravo charlie" }]}
      />,
    )

    const [, ...body] = lines(lastFrame())
    expect(body.length).toBeGreaterThan(1)
    expect(body.join(" ")).toContain("alpha")
    expect(body.join(" ")).toContain("charlie")

    for (const line of body) expect(line.length).toBeLessThanOrEqual(10)
  })

  it("truncates with an ellipsis by default rather than wrapping", () => {
    const { lastFrame } = render(
      <Table
        maxWidth={40}
        columns={[{ key: "program", header: "Program", width: 10 }]}
        data={[{ program: "alpha bravo charlie" }]}
      />,
    )

    const body = lines(lastFrame()).slice(1)
    expect(body).toHaveLength(1)
    expect(body[0]).toContain("…")
    expect(body[0]).not.toContain("charlie")
  })

  it("keeps the next row below the tallest cell of a ragged row", () => {
    const { lastFrame } = render(
      <Table
        maxWidth={40}
        columns={[
          { key: "name", header: "Name", width: 6 },
          { key: "program", header: "Program", width: 10, overflow: "wrap" },
        ]}
        data={[
          { name: "api", program: "alpha bravo charlie" },
          { name: "db", program: "short" },
        ]}
      />,
    )

    const body = lines(lastFrame()).slice(1)
    // The first row is three lines tall because its second cell wrapped; the
    // second row must start after all three, not overlap them.
    const first = body.findIndex((line) => line.includes("api"))
    const second = body.findIndex((line) => line.includes("db"))
    expect(first).toBe(0)
    expect(second).toBe(3)
    expect(body[second]).toContain("short")
    // The tall cell's continuation lines belong to it alone — no stray first-column text.
    expect(body[1]).not.toContain("api")
    expect(body[2]).not.toContain("api")
  })

  it("aligns a column right or centre when asked", () => {
    const { lastFrame } = render(
      <Table
        maxWidth={40}
        columns={[
          { key: "left", header: "L", width: 8 },
          { key: "middle", header: "M", width: 8, align: "center" },
          { key: "right", header: "R", width: 8, align: "right" },
        ]}
        data={[{ left: "a", middle: "b", right: "c" }]}
      />,
    )

    const row = lines(lastFrame())[1] ?? ""
    expect(row.indexOf("a")).toBe(0)
    // Centre lands mid-column; right lands at its far edge. Both are measured
    // against the left column's own start so a gap change cannot silently pass.
    expect(row.indexOf("b")).toBe(13)
    expect(row.indexOf("c")).toBe(27)
  })

  it("shrinks a flexible column so a wide table still fits its bounds", () => {
    const { lastFrame } = render(
      <Table
        maxWidth={20}
        columns={[
          { key: "name", header: "Name" },
          { key: "program", header: "Program" },
        ]}
        data={[{ name: "api", program: "x".repeat(40) }]}
      />,
    )

    for (const line of lines(lastFrame())) expect(line.length).toBeLessThanOrEqual(20)
  })

  it("renders a nullish cell as empty rather than as the word undefined", () => {
    const { lastFrame } = render(
      <Table
        maxWidth={40}
        columns={[
          { key: "name", header: "Name" },
          { key: "note", header: "Note" },
        ]}
        data={[{ name: "api", note: undefined }]}
      />,
    )

    expect(lastFrame()).not.toContain("undefined")
  })
  it("windows rows while preserving a selected-row marker", () => {
    const data = Array.from({length: 20}, (_, i) => ({name: "entry" + i}))
    const frame = render(
      <Table columns={[{key: "name", header: "Name"}]} data={data}
        maxVisible={4} selectedIndex={15} maxWidth={25}/>
    ).lastFrame() ?? ""
    expect(frame).toContain("entry15")
    expect(frame).not.toContain("entry0")
    expect(frame).toContain("❯")
    expect(frame).toContain("/ 20")
  })

  it("renders a useful empty state", () => {
    const frame = render(<Table columns={[{key: "name", header: "Name"}]}
      data={[]} emptyText="Nothing here"/>).lastFrame() ?? ""
    expect(frame).toContain("Nothing here")
  })
})
