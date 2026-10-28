import React, { useState, useEffect } from "react"
import { Box, Text } from "ink"
import { colors, motion, spacing } from "../tokens.js"

type SpinnerProps = {
  label?: string
  /** Use ASCII spinner frames on limited terminals. */
  ascii?: boolean
}

export const Spinner = ({ label, ascii = false }: SpinnerProps) => {
  const [frame, setFrame] = useState(0)
  const frames = ascii ? motion.asciiSpinner : motion.spinner

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((prev) => (prev + 1) % frames.length)
    }, motion.intervalMs)

    return () => clearInterval(timer)
  }, [ascii])

  return (
    <Box gap={spacing.xs}>
      <Text color={colors.accent}>{frames[frame % frames.length]}</Text>
      {label && <Text dimColor>{label}</Text>}
    </Box>
  )
}
