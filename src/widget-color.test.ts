import {describe, expect, it} from 'vitest';
import {resolveWidgetColor} from './widget-color.js';

describe('widget foreground overrides', () => {
  it('preserves defaults, accepts host semantic colors and explicitly restores terminal foreground', () => {
    expect(resolveWidgetColor(undefined, '#89DDFF')).toBe('#89DDFF');
    expect(resolveWidgetColor('#FFB000', '#89DDFF')).toBe('#FFB000');
    expect(resolveWidgetColor('yellow', '#89DDFF')).toBe('yellow');
    expect(resolveWidgetColor(null, '#89DDFF')).toBeUndefined();
    expect(resolveWidgetColor(undefined, undefined)).toBeUndefined();
  });
});
