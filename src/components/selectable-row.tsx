import React from 'react';
import {Box, Text, type TextProps} from 'ink';
import stringWidth from 'string-width';
import {colors, symbols} from '../tokens.js';
import {resolveWidgetColor, type WidgetColor} from '../widget-color.js';

type SelectableRowProps = {
  active?: boolean;
  marker?: string;
  /** Omit to use the info token; null uses the terminal foreground. */
  markerColor?: WidgetColor;
  /** Applied to string and number children; React nodes keep their own styling. */
  textColor?: WidgetColor;
  /** Spaces before the marker. Defaults to two. */
  indent?: number;
  children: React.ReactNode;
};

const isTextValue = (value: React.ReactNode): value is string | number =>
  typeof value === 'string' || typeof value === 'number';

// Internal: the non-TTY test renderer does not expose color escape sequences.
type SelectableRowColors = {
  markerColor: TextProps['color'];
  textColor: TextProps['color'];
};

export const resolveSelectableRowColors = (
  markerColor?: WidgetColor,
  textColor?: WidgetColor,
): SelectableRowColors => ({
  markerColor: resolveWidgetColor(markerColor, colors.info),
  textColor: resolveWidgetColor(textColor, undefined),
});

export const SelectableRow = ({
  active = false,
  marker = symbols.pointer,
  markerColor,
  textColor,
  indent = 2,
  children,
}: SelectableRowProps) => {
  const style = resolveSelectableRowColors(markerColor, textColor);
  const padding = ' '.repeat(Math.max(0, Math.floor(indent)));

  const gutter = active
    ? `${padding}${marker} `
    : `${padding}${' '.repeat(stringWidth(marker) + 1)}`;

  return (
    <Box>
      {/* The gutter must never shrink. A row whose content overflows its
        container compresses every flexible child, and this one is four
        cells wide by default — losing a single column shifts the whole row
        left and breaks alignment with its neighbours, but only for rows long
        enough to overflow, which is why it survives short test fixtures. */}
      <Box flexShrink={0}>
        <Text color={style.markerColor}>{gutter}</Text>
      </Box>
      {isTextValue(children) ? (
        <Text bold={active} color={style.textColor}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Box>
  );
};
