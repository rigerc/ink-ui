import { describe, expect, it } from "vitest"
import { knownTerminalColumns } from "./use-terminal-columns.js"

describe("knownTerminalColumns", () => {
  it("uses the live window size when stdout has known TTY columns", () => {
    expect(knownTerminalColumns({ columns: 120 }, 120)).toBe(120)
    expect(knownTerminalColumns({ columns: 120 }, 92)).toBe(92)
  })

  it("does not treat Ink's non-TTY fallback as a visible edge", () => {
    expect(knownTerminalColumns({}, 80)).toBeUndefined()
    expect(knownTerminalColumns({ columns: undefined }, 80)).toBeUndefined()
    expect(knownTerminalColumns({ columns: 0 }, 80)).toBeUndefined()
    expect(knownTerminalColumns({ columns: NaN }, 80)).toBeUndefined()
    expect(knownTerminalColumns({ columns: "80" }, 80)).toBeUndefined()
    expect(knownTerminalColumns(null, 80)).toBeUndefined()
  })
})
