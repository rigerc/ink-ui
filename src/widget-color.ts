import type {TextProps} from 'ink';

/** Omit to retain a widget's default; null opts into the terminal's foreground. */
export type WidgetColor = TextProps['color'] | null;

/** Internal resolver: null is deliberately different from an omitted override. */
export function resolveWidgetColor(
  override: WidgetColor,
  fallback: TextProps['color'],
): TextProps['color'] {
  return override === null ? undefined : override === undefined ? fallback : override;
}
