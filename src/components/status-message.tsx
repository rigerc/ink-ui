// Ported from @inkjs/ui (MIT, Vadim Demedes — https://github.com/vadimdemedes/ink-ui)
// and adapted to @rigerc/ink-ui tokens and conventions.
import React from 'react';
import {Box, Text, type TextProps} from 'ink';
import {statusVariant, type StatusVariant} from './status-variants.js';
import {resolveWidgetColor, type WidgetColor} from '../widget-color.js';

type StatusMessageProps = {
  variant?: StatusVariant;
  children: React.ReactNode;
  icon?: string;
  color?: WidgetColor;
  textColor?: WidgetColor;
};

type StatusMessageAppearance = {
  icon: string;
  color: TextProps['color'];
  textColor: TextProps['color'];
};

// Kept pure so appearance decisions are testable without terminal ANSI output.
export const statusMessageAppearance = (
  variant: StatusVariant,
  icon?: string,
  color?: WidgetColor,
  textColor?: WidgetColor,
): StatusMessageAppearance => {
  const defaults = statusVariant(variant);

  return {
    icon: icon ?? defaults.icon,
    color: resolveWidgetColor(color, defaults.color),
    textColor: resolveWidgetColor(textColor, undefined),
  };
};

export const StatusMessage = ({
  variant = 'info',
  children,
  icon,
  color,
  textColor,
}: StatusMessageProps) => {
  const appearance = statusMessageAppearance(variant, icon, color, textColor);

  return (
    <Box gap={1}>
      <Text color={appearance.color}>{appearance.icon}</Text>
      <Text color={appearance.textColor}>{children}</Text>
    </Box>
  );
};
