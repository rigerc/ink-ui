// Generic fixed-row-height viewport inspired by ink-virtual-list (MIT).
// Presentational: the host owns navigation and passes selectedIndex.
import React, {useEffect, useImperativeHandle, useState} from "react"
import {Box, Text} from "ink"
import {colors} from "../tokens.js"

export type VirtualListHandle = {
  scrollToIndex: (index: number) => void
}

type VirtualListProps<T> = {
  items: readonly T[]
  /** Number of item rows to render; the optional indicator is an extra line. */
  height: number
  renderItem: (item: T, index: number) => React.ReactNode
  getKey?: (item: T, index: number) => React.Key
  /** Keep the selected row visible when it changes. Does not bind keys. */
  selectedIndex?: number
  initialIndex?: number
  showIndicator?: boolean
  emptyText?: string
  ref?: React.Ref<VirtualListHandle>
}

const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, Number.isFinite(value) ? Math.floor(value) : low))

export const ensureVisible = (
  start: number,
  index: number,
  length: number,
  height: number,
): number => {
  const size = Math.max(1, Math.floor(height) || 1)
  const limit = Math.max(0, length - size)
  const current = clamp(start, 0, limit)
  if (length === 0 || !Number.isFinite(index) || index < 0) return current
  const target = clamp(index, 0, length - 1)
  if (target < current) return target
  if (target >= current + size) return Math.min(limit, target - size + 1)
  return current
}

export const VirtualList = <T,>({
  items,
  height,
  renderItem,
  getKey,
  selectedIndex,
  initialIndex = 0,
  showIndicator = true,
  emptyText = "No items",
  ref,
}: VirtualListProps<T>) => {
  const size = Number.isFinite(height) ? Math.max(1, Math.floor(height)) : 1
  const length = items.length
  const [start, setStart] = useState(() =>
    ensureVisible(0, selectedIndex ?? initialIndex, length, size),
  )
  const limit = Math.max(0, length - size)
  const visibleStart = clamp(start, 0, limit)

  // Moving a cursor does not require remounting items outside the viewport.
  useEffect(() => {
    setStart((current) => ensureVisible(current, selectedIndex ?? -1, length, size))
  }, [selectedIndex, length, size])

  useImperativeHandle(ref, () => ({
    scrollToIndex(index: number) {
      setStart((current) => ensureVisible(current, index, length, size))
    },
  }), [length, size])

  const visible = items.slice(visibleStart, visibleStart + size)
  return (
    <Box flexDirection="column">
      {length === 0 ? <Text color={colors.muted}>{emptyText}</Text> : visible.map((item, i) => {
        const index = visibleStart + i
        return (
          <Box key={getKey?.(item, index) ?? index} flexDirection="column">
            {renderItem(item, index)}
          </Box>
        )
      })}
      {showIndicator && length > size ? (
        <Text color={colors.muted}>
          {String(visibleStart + 1) + "–" + String(visibleStart + visible.length) + " / " + String(length)}
        </Text>
      ) : null}
    </Box>
  )
}
