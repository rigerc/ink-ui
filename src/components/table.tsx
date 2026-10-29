import React from 'react';
import {Box, Text} from 'ink';
import {useTerminalColumns} from './use-terminal-columns.js';
import {colors, symbols} from '../tokens.js';
import {resolveColumnWidths, type ColumnAlign, type ColumnOverflow} from './table-layout.js';

export type {ColumnAlign, ColumnOverflow};

export type Column<T extends Record<string, unknown>> = {
  key: keyof T & string;
  header: string;
  width?: number;
  minWidth?: number;
  align?: ColumnAlign;
  overflow?: ColumnOverflow;
};

type TableProps<T extends Record<string, unknown>> = {
  data: T[];
  columns: Column<T>[];
  gap?: number;
  maxWidth?: number;
  headerColor?: string;
  /** Presentational selection: reserve a marker gutter on every row. */
  selectedIndex?: number;
  /** Windowed row count, independent of header and optional indicators. */
  maxVisible?: number;
  emptyText?: string;
};

// Used only when nothing else can say how wide the terminal is — a piped or
// captured stdout reports no column count at all.
const FALLBACK_TERMINAL_WIDTH = 80;

const justification = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
} as const;

export const Table = <T extends Record<string, unknown>>({
  data,
  columns,
  gap = 2,
  maxWidth,
  headerColor = colors.muted,
  selectedIndex,
  maxVisible,
  emptyText = 'No data',
}: TableProps<T>) => {
  const terminalColumns = useTerminalColumns();

  const rows = data.map((row) => columns.map((column) => String(row[column.key] ?? '')));

  const selectionGutter = selectedIndex === undefined ? 0 : 2;
  const count = maxVisible === undefined ? data.length : Math.max(1, Math.floor(maxVisible) || 1);

  const target =
    selectedIndex === undefined || !Number.isFinite(selectedIndex)
      ? 0
      : Math.max(0, Math.min(data.length - 1, Math.floor(selectedIndex)));

  const start = Math.max(0, Math.min(target - Math.floor(count / 2), data.length - count));
  const visible = rows.slice(start, start + count);

  const widths = resolveColumnWidths({
    columns,
    rows,
    gap,
    maxWidth: Math.max(
      1,
      (maxWidth ?? terminalColumns ?? FALLBACK_TERMINAL_WIDTH) - selectionGutter,
    ),
  });

  // flexShrink={0} is what keeps every row's columns lining up: the widths were
  // measured once for the whole table, so letting Yoga renegotiate them per row
  // would make each row disagree with its neighbours.
  const cell = (column: Column<T>, index: number, content: React.ReactNode) => (
    <Box
      key={column.key}
      width={widths[index]}
      flexShrink={0}
      flexGrow={0}
      justifyContent={justification[column.align ?? 'left']}
    >
      {content}
    </Box>
  );

  return (
    <Box flexDirection="column">
      <Box gap={gap}>
        {selectionGutter > 0 ? (
          <Box width={2} flexShrink={0}>
            <Text>{'  '}</Text>
          </Box>
        ) : null}
        {columns.map((column, index) =>
          cell(
            column,
            index,
            <Text bold color={headerColor} wrap="truncate-end">
              {column.header}
            </Text>,
          ),
        )}
      </Box>
      {visible.map((cells, rowIndex) => (
        <Box
          key={start + rowIndex}
          gap={gap}
          backgroundColor={selectedIndex === start + rowIndex ? colors.selection : undefined}
        >
          {selectionGutter > 0 ? (
            <Box width={2} flexShrink={0}>
              <Text color={colors.info}>
                {selectedIndex === start + rowIndex ? symbols.pointer + ' ' : '  '}
              </Text>
            </Box>
          ) : null}
          {columns.map((column, index) =>
            cell(
              column,
              index,
              <Text
                bold={selectedIndex === start + rowIndex}
                wrap={column.overflow === 'wrap' ? 'wrap' : 'truncate-end'}
              >
                {cells[index]}
              </Text>,
            ),
          )}
        </Box>
      ))}
      {data.length === 0 ? <Text color={colors.muted}>{emptyText}</Text> : null}
      {maxVisible !== undefined && data.length > count ? (
        <Text color={colors.muted}>
          {String(start + 1) + '–' + String(start + visible.length) + ' / ' + String(data.length)}
        </Text>
      ) : null}
    </Box>
  );
};
