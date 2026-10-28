import { useStdout, useWindowSize } from "ink"

const isPositiveNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0

type TerminalOutput = NodeJS.WritableStream | { columns?: number | string } | null

// Ink 8 types stdout as a generic output stream, without TTY-only columns.
// A window-size fallback is useful for Table, but Tabs must not assume a
// captured/piped stream has a visible edge at that fallback width.
export const knownTerminalColumns = (
  stdout: TerminalOutput,
  windowColumns: number,
): number | undefined => {
  if (stdout === null || !("columns" in stdout))
    return undefined

  const columns = stdout.columns

  return isPositiveNumber(columns)
    ? windowColumns
    : undefined
}

export const useTerminalColumns = (): number | undefined => {
  const { stdout } = useStdout()
  const { columns } = useWindowSize()

  return knownTerminalColumns(stdout, columns)
}
