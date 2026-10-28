import React, { useState } from "react"
import { Box, Text, useInput } from "ink"
import {
  Spinner,
  asciiSymbols,
  borders,
  colors,
  motion,
  spacing,
  symbols,
} from "../index.js"

type Props = { focused: boolean }

const semanticColors = [
  ["accent", colors.accent],
  ["success", colors.success],
  ["error", colors.error],
  ["warning", colors.warning],
  ["info", colors.info],
  ["muted", colors.muted],
] as const

/** Live reference for the single, shared ink-ui token system. */
export const TokensDemo = ({ focused }: Props) => {
  const [ascii, setAscii] = useState(false)
  const glyphs = ascii ? asciiSymbols : symbols

  useInput(
    (input) => {
      if (input === "a") setAscii((value) => !value)
    },
    { isActive: focused },
  )

  return (
    <Box flexDirection="column" gap={spacing.xs}>
      <Text bold>Semantic colors</Text>
      <Box flexWrap="wrap" columnGap={spacing.sm}>
        {semanticColors.map(([name, color]) => (
          <Text key={name} color={color}>
            {glyphs.active} {name}
          </Text>
        ))}
      </Box>
      <Text bold>Symbols · {ascii ? "ASCII" : "Unicode"}</Text>
      <Text>
        <Text color={colors.success}>{glyphs.success} success</Text>
        {"  "}
        <Text color={colors.error}>{glyphs.error} error</Text>
        {"  "}
        <Text color={colors.warning}>{glyphs.warn} warning</Text>
      </Text>
      <Text>
        <Text color={colors.info}>{glyphs.info} info</Text>
        {"  "}
        <Text color={colors.accent}>{glyphs.pointer} current</Text>
        {"  "}
        <Text color={colors.muted}>{glyphs.pending} pending</Text>
      </Text>
      <Text>
        {glyphs.checkboxChecked} checked  {glyphs.checkboxUnchecked} unchecked
      </Text>
      <Text>
        {glyphs.bullet} bullet  {glyphs.nestedBullet} nested  {glyphs.nestedBulletEmpty} nested empty
      </Text>
      <Text color={colors.muted}>
        {glyphs.line.repeat(6)} line  {glyphs.verticalLine} separator  {glyphs.ellipsis} more
      </Text>
      <Text color={colors.muted}>
        {glyphs.rule.repeat(6)} rule  {glyphs.caret} caret
      </Text>
      <Text>
        <Text color={colors.accent}>{glyphs.barFull.repeat(8)}</Text>
        <Text color={colors.track}>{glyphs.barEmpty.repeat(4)}</Text>
        {"  progress tokens"}
      </Text>
      <Text dimColor>
        Spacing: xs={spacing.xs} sm={spacing.sm} md={spacing.md} lg={spacing.lg}
      </Text>
      <Text bold>Borders</Text>
      <Box gap={spacing.xs} flexWrap="wrap">
        <Box borderStyle={ascii ? borders.ascii : borders.base} borderColor={colors.muted} paddingX={spacing.xs}>
          <Text>base</Text>
        </Box>
        <Box borderStyle={ascii ? borders.ascii : borders.focus} borderColor={colors.accent} paddingX={spacing.xs}>
          <Text>focus</Text>
        </Box>
      </Box>
      <Text bold>Motion</Text>
      <Spinner ascii={ascii} label={`spinner ${motion.intervalMs}ms · skeleton ${motion.skeletonIntervalMs}ms`} />
      <Text dimColor>a toggle Unicode / ASCII · Esc return to gallery</Text>
    </Box>
  )
}
