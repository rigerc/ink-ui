import React from "react"
import {render} from "ink-testing-library"
import {describe, expect, it} from "vitest"
import {TreeView, flattenTree, type TreeNode} from "./tree-view.js"

const nodes: TreeNode[] = [
  {id: "src", label: "src", children: [
    {id: "a", label: "a.ts"},
    {id: "lib", label: "lib", children: [{id: "b", label: "b.ts"}]},
  ]},
  {id: "docs", label: "docs"},
]

describe("TreeView", () => {
  it("flattens expanded branches and preserves depth and order", () => {
    const closed = flattenTree(nodes, new Set())
    expect(closed.map((row) => row.node.id)).toEqual(["src", "docs"])
    const open = flattenTree(nodes, new Set(["src", "lib"]))
    expect(open.map((row) => row.node.id)).toEqual(["src", "a", "lib", "b", "docs"])
    expect(open.find((row) => row.node.id === "b")?.depth).toBe(2)
  })
  it("renders accessible expansion and cursor glyphs", () => {
    const frame = render(<TreeView nodes={nodes} expandedIds={new Set(["src"])} selectedId="a"/>).lastFrame() ?? ""
    expect(frame).toContain("▾ src")
    expect(frame).toContain("a.ts")
    expect(frame).toContain("▸ lib")
    expect(frame).not.toContain("b.ts")
  })
  it("supports ASCII fallback and a bounded viewport", () => {
    const frame = render(<TreeView nodes={nodes} expandedIds={new Set(["src", "lib"])}
      selectedId="b" ascii maxVisible={2}/>).lastFrame() ?? ""
    expect(frame).toContain("b.ts")
    expect(frame).not.toContain("docs")
  })
  it("renders an empty-state label", () => {
    expect(render(<TreeView nodes={[]} emptyText="Empty tree"/>).lastFrame()).toContain("Empty tree")
  })
})
