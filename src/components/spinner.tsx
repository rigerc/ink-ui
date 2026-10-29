import React, {useState, useEffect} from 'react';
import {Box, Text} from 'ink';
import {asciiSymbols, colors, motion, spacing, symbols} from '../tokens.js';
import {resolveWidgetColor, type WidgetColor} from '../widget-color.js';

type SpinnerProps = {
  label?: string;
  /** Use ASCII spinner frames on limited terminals. */
  ascii?: boolean;
  /** Motion opt-out; NO_MOTION and REDUCE_MOTION also disable animation. */
  animate?: boolean;
  /** Glyph to show without motion; defaults to the pending symbol. */
  staticFrame?: string;
  color?: WidgetColor;
  labelColor?: WidgetColor;
  dimLabel?: boolean;
};

export const Spinner = ({
  label,
  ascii = false,
  animate = true,
  staticFrame,
  color,
  labelColor,
  dimLabel = true,
}: SpinnerProps) => {
  const [frame, setFrame] = useState(0);
  const frames = ascii ? motion.asciiSpinner : motion.spinner;
  const animated = animate && !process.env['NO_MOTION'] && !process.env['REDUCE_MOTION'];

  useEffect(() => {
    if (!animated) return;

    const timer = setInterval(() => {
      setFrame((prev) => (prev + 1) % frames.length);
    }, motion.intervalMs);

    return () => clearInterval(timer);
  }, [frames, animated]);

  return (
    <Box gap={spacing.xs}>
      <Text color={resolveWidgetColor(color, colors.accent)}>
        {animated
          ? frames[frame % frames.length]
          : (staticFrame ?? (ascii ? asciiSymbols.pending : symbols.pending))}
      </Text>
      {label && (
        <Text color={resolveWidgetColor(labelColor, undefined)} dimColor={dimLabel}>
          {label}
        </Text>
      )}
    </Box>
  );
};
