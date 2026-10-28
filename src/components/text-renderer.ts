import { createContext } from "react"
import { Text } from "ink"

// Internal seam for observing rendered text props in non-TTY tests.
export const TextRenderer = createContext(Text)
