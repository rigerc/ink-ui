// Adapted from the grouped legend pattern in @matthesketh/ink-keybinding-help (MIT).
// The host owns ? / Escape; this component registers no input handlers.
import React from "react"
import {Box, Text} from "ink"
import stringWidth from "string-width"
import {Panel} from "./panel.js"
import {colors} from "../tokens.js"
import type {Hint} from "./footer-hints.js"

export type KeyBindingGroup = {
  title: string
  bindings: Hint[]
}

type KeybindingHelpProps = {
  groups: KeyBindingGroup[]
  title?: string
  columns?: number
  visible?: boolean
  width?: number
}

export const KeybindingHelp = ({
  groups,
  title = "Keyboard shortcuts",
  columns = 2,
  visible = true,
  width,
}: KeybindingHelpProps) => {
  if (!visible) return null
  const count = Math.max(1, Math.min(groups.length || 1, Math.floor(columns) || 1))
  const arranged = Array.from({length: count}, () => [] as KeyBindingGroup[])
  groups.forEach((group, index) => arranged[index % count]!.push(group))

  return (
    <Panel title={title} width={width}>
      <Box gap={3}>
        {arranged.map((column, index) => (
          <Box key={index} flexDirection="column" flexGrow={1} flexBasis={0}>
            {column.map((group, i) => {
              const keyWidth = Math.max(0, ...group.bindings.map(([key]) => stringWidth(key)))
              return (
                <Box key={i} flexDirection="column" marginBottom={1}>
                  <Text bold color={colors.secondary}>{group.title}</Text>
                  {group.bindings.map(([key, description], row) => (
                    <Box key={row} gap={2}>
                      <Box width={keyWidth} flexShrink={0}><Text>{key}</Text></Box>
                      <Text color={colors.muted}>{description}</Text>
                    </Box>
                  ))}
                </Box>
              )
            })}
          </Box>
        ))}
      </Box>
    </Panel>
  )
}
