import { useStdout, useWindowSize } from "ink"

// Ink 8 types stdout as a generic output stream, without TTY-only columns.
// A window-size fallback is useful for Table, but Tabs must not assume a
// captured/piped stream has a visible edge at that fallback width.
export const knownTerminalColumns = (
  stdout: unknown,
  windowColumns: number,
): number | undefined => {
  if (typeof stdout !== "object" || stdout === null || !("columns" in stdout))
    return undefined

  const columns = stdout.columns

  return typeof columns === "number" && Number.isFinite(columns) && columns > 0
    ? windowColumns
    : undefined
}

export const useTerminalColumns = (): number | undefined => {
  const { stdout } = useStdout()
  const { columns } = useWindowSize()

  return knownTerminalColumns(stdout, columns)
}
