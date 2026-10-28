// Ported from @inkjs/ui (MIT, Vadim Demedes — https://github.com/vadimdemedes/ink-ui)
// and adapted to @rigerc/ink-ui tokens and conventions.
import React from "react"
import { Box, Text } from "ink"
import { statusVariant, type StatusVariant } from "./status-variants.js"
import { borders, spacing } from "../tokens.js"

type AlertProps = {
  variant?: StatusVariant
  title?: string
  children: React.ReactNode
}

export const Alert = ({ variant = "info", title, children }: AlertProps) => {
  const { icon, color } = statusVariant(variant)
  return (
    <Box
      borderStyle={borders.base}
      borderColor={color}
      paddingX={spacing.xs}
      flexDirection="column"
    >
      <Box gap={spacing.xs}>
        <Text color={color}>{icon}</Text>
        {title ? (
          <Text bold color={color}>
            {title}
          </Text>
        ) : null}
      </Box>
      <Text>{children}</Text>
    </Box>
  )
}
