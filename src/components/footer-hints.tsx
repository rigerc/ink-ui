import React from 'react';
import {Box, Text, type TextProps} from 'ink';
import {spacing} from '../tokens.js';
import {resolveWidgetColor, type WidgetColor} from '../widget-color.js';

export type Hint = [key: string, label: string];

type FooterHintsProps = {
  hints: Hint[];
  /**
   * Where this page sits, so the footer can end the same way on every page
   * of every app: `⌫ back` on a nested page, then `? help`, then `q quit`,
   * always last. A host passes only its own hints — navigation, actions,
   * modes — and never these three. Omit it to draw the hints as given.
   */
  page?: 'root' | 'nested';
  /** Drop `? help` from the tail for an app with no legend. */
  help?: boolean;
  /** Omit for white keys; null uses the terminal foreground. */
  keyColor?: WidgetColor;
  labelColor?: WidgetColor;
  dimLabels?: boolean;
  /** Label for the nested page's back key. Defaults to ⌫. */
  backKey?: string;
  /** Horizontal spacing only; wrapped hint rows remain adjacent. */
  columnGap?: number;
};

/** The cells every page ends with, in the order the eye learns once. */
export const tailHints = (page: 'root' | 'nested', help = true, backKey = '⌫'): Hint[] => [
  ...(page === 'nested' ? ([[backKey, 'back']] satisfies Hint[]) : []),
  ...(help ? ([['?', 'help']] satisfies Hint[]) : []),
  ['q', 'quit'],
];

// Internal: the non-TTY test renderer does not expose color escape sequences.
type FooterHintStyle = {
  keyColor: TextProps['color'];
  labelColor: TextProps['color'];
  dimLabels: boolean;
};

export const resolveFooterHintStyle = (
  keyColor?: WidgetColor,
  labelColor?: WidgetColor,
  dimLabels = true,
): FooterHintStyle => ({
  keyColor: resolveWidgetColor(keyColor, 'white'),
  labelColor: resolveWidgetColor(labelColor, undefined),
  dimLabels,
});

// columnGap, not gap: `gap` sets both axes, so once the hints wrap — which they
// do in any narrow terminal, or inside a border — the 2 meant as spacing between
// hints also became 2 blank rows between hint lines, shoving the footer around.
export const FooterHints = ({
  hints,
  page,
  help = true,
  keyColor,
  labelColor,
  dimLabels = true,
  backKey = '⌫',
  columnGap = spacing.sm,
}: FooterHintsProps) => {
  const all = page ? [...hints, ...tailHints(page, help, backKey)] : hints;
  const style = resolveFooterHintStyle(keyColor, labelColor, dimLabels);

  return (
    <Box columnGap={columnGap} rowGap={0} flexWrap="wrap">
      {all.map(([key, label], index) => (
        <Box key={`${index}:${key}`}>
          <Text color={style.keyColor}>{key}</Text>
          <Text color={style.labelColor} dimColor={style.dimLabels}>
            {' ' + label}
          </Text>
        </Box>
      ))}
    </Box>
  );
};
