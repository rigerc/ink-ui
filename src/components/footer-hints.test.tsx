import React from 'react';
import {Box} from 'ink';
import {render} from 'ink-testing-library';
import {describe, it, expect} from 'vitest';
import {FooterHints, resolveFooterHintStyle, tailHints, type Hint} from './footer-hints.js';

const hints: Hint[] = [
  ['↑↓', 'nav'],
  ['↵', 'open'],
  ['r', 'refresh'],
  ['q', 'quit'],
];

describe('FooterHints', () => {
  it('renders each key with its label', () => {
    const {lastFrame} = render(<FooterHints hints={hints} />);
    const frame = lastFrame() ?? '';
    expect(frame).toContain('↑↓ nav');
    expect(frame).toContain('q quit');
  });

  it('lays hints out on one row when they fit', () => {
    const {lastFrame} = render(<FooterHints hints={hints} />);
    const lines = (lastFrame() ?? '').split('\n').filter((l) => l.trim());
    expect(lines).toHaveLength(1);
    expect(lastFrame()).toBe('↑↓ nav  ↵ open  r refresh  q quit');
  });

  it('resolves default, explicit, and terminal foreground colors and label dimming', () => {
    expect(resolveFooterHintStyle()).toEqual({
      keyColor: 'white',
      labelColor: undefined,
      dimLabels: true,
    });
    expect(resolveFooterHintStyle('cyan', 'yellow', false)).toEqual({
      keyColor: 'cyan',
      labelColor: 'yellow',
      dimLabels: false,
    });
    expect(resolveFooterHintStyle(null, null, false)).toEqual({
      keyColor: undefined,
      labelColor: undefined,
      dimLabels: false,
    });
    expect(resolveFooterHintStyle(undefined, 'red')).toEqual({
      keyColor: 'white',
      labelColor: 'red',
      dimLabels: true,
    });
  });

  it('supports custom spacing and repeated key labels', () => {
    const {lastFrame} = render(
      <FooterHints
        hints={[
          ['x', 'first'],
          ['x', 'second'],
        ]}
        columnGap={4}
      />,
    );

    expect(lastFrame()).toBe('x first    x second');
  });

  it('wraps without inserting blank rows between hint lines', () => {
    // Regression: the component used `gap={2}`, which sets *both* axes — so once
    // the hints wrapped, the horizontal spacing became 2 blank rows of vertical
    // spacing too, shoving whatever sat below the footer out of place.
    const {lastFrame} = render(
      <Box width={20}>
        <FooterHints hints={hints} />
      </Box>,
    );

    const lines = (lastFrame() ?? '').split('\n');
    // It must wrap at this width — otherwise the test isn't exercising anything.
    expect(lines.length).toBeGreaterThan(1);
    // No blank line may sit between the first and last non-empty rows.
    const firstContent = lines.findIndex((l) => l.trim());

    const lastContent = lines.length - 1 - [...lines].reverse().findIndex((l) => l.trim());

    const between = lines.slice(firstContent, lastContent + 1);
    expect(between.every((l) => l.trim())).toBe(true);
  });

  it('keeps wrapped rows adjacent with custom horizontal spacing', () => {
    const {lastFrame} = render(
      <Box width={20}>
        <FooterHints hints={hints} columnGap={5} />
      </Box>,
    );

    const lines = (lastFrame() ?? '').split('\n');
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.every((line) => line.trim().length > 0)).toBe(true);
  });
});

describe('FooterHints tail', () => {
  it('ends every page the same way, with back only when nested', () => {
    const root = render(<FooterHints hints={[['a', 'one']]} page="root" />);
    const nested = render(<FooterHints hints={[['a', 'one']]} page="nested" />);
    expect(root.lastFrame()).toMatch(/a one.*\? help.*q quit$/);
    expect(root.lastFrame()).not.toContain('back');
    expect(nested.lastFrame()).toMatch(/a one.*⌫ back.*\? help.*q quit$/);
  });

  it('drops help for an app with no legend', () => {
    const {lastFrame} = render(<FooterHints hints={[]} page="root" help={false} />);
    expect(lastFrame()).toBe('q quit');
  });

  it('uses a custom ASCII back key in both the helper and rendered tail', () => {
    expect(tailHints('nested', false, 'esc')).toEqual([
      ['esc', 'back'],
      ['q', 'quit'],
    ]);
    expect(tailHints('root', true, 'esc')).toEqual([
      ['?', 'help'],
      ['q', 'quit'],
    ]);
    const {lastFrame} = render(<FooterHints hints={[]} page="nested" backKey="esc" />);
    expect(lastFrame()).toBe('esc back  ? help  q quit');
    expect(lastFrame()).toMatch(/^[\x20-\x7E]+$/);
  });

  it('updates back key and spacing when appearance props change', async () => {
    const {lastFrame, rerender} = render(<FooterHints hints={[]} page="nested" />);
    rerender(
      <FooterHints
        hints={[]}
        page="nested"
        backKey="esc"
        columnGap={0}
        keyColor={null}
        labelColor={null}
        dimLabels={false}
      />,
    );
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(lastFrame()).toBe('esc back? helpq quit');
    rerender(<FooterHints hints={[]} page="nested" />);
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(lastFrame()).toBe('⌫ back  ? help  q quit');
  });
});
