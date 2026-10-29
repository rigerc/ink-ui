import React from 'react';
import {Text} from 'ink';
import stringWidth from 'string-width';
import {colors, symbols} from '../tokens.js';
import {useTerminalColumns} from './use-terminal-columns.js';

type DividerProps = {
  /** Override the terminal width when used inside a narrow pane. */
  width?: number;
  label?: string;
  character?: string;
};

/** Pure width-aware rule builder; do not split wide characters across cells. */
export const dividerLine = (width: number, label = '', character = symbols.line): string => {
  const cells = Math.max(0, Math.floor(Number.isFinite(width) ? width : 0));
  const glyph = stringWidth(character) === 1 ? character : symbols.line;

  if (cells === 0) return '';

  if (!label) return glyph.repeat(cells);
  const caption = ' ' + label + ' ';
  const size = stringWidth(caption);

  if (size >= cells) {
    let result = '';

    for (const ch of caption) {
      if (stringWidth(result + ch) > cells) break;
      result += ch;
    }

    return result.padEnd(cells, ' ');
  }

  return caption + glyph.repeat(cells - size);
};

/** Single-line separator. Supply width for panes; otherwise uses terminal width. */
export const Divider = ({width, label, character}: DividerProps) => {
  const columns = useTerminalColumns();

  return (
    <Text color={colors.dim} wrap="truncate-end">
      {dividerLine(width ?? columns ?? 80, label, character)}
    </Text>
  );
};
