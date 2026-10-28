import React from 'react';
import {render} from 'ink-testing-library';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {asciiSymbols, motion, symbols} from '../tokens.js';
import {Spinner} from './spinner.js';

describe('Spinner', () => {
  beforeEach(() => {
    vi.stubEnv('NO_MOTION', '');
    vi.stubEnv('REDUCE_MOTION', '');
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });
  it('uses the shared Unicode motion tokens by default', () => {
    const output = render(<Spinner label="Working" />);
    expect(output.lastFrame()).toContain(motion.spinner[0]);
    expect(output.lastFrame()).toContain('Working');
    output.unmount();
  });

  it('supports the shared ASCII motion tokens', () => {
    const output = render(<Spinner ascii label="Loading" />);
    expect(output.lastFrame()).toContain(motion.asciiSpinner[0]);
    expect(output.lastFrame()).toContain('Loading');
    output.unmount();
  });

  it('uses pending symbols without starting a timer when static', async () => {
    const timers = vi.spyOn(globalThis, 'setInterval');
    const unicode = render(<Spinner animate={false} label="Waiting" />);
    const ascii = render(<Spinner animate={false} ascii />);
    expect(unicode.lastFrame()).toContain(`${symbols.pending} Waiting`);
    expect(ascii.lastFrame()).toBe(asciiSymbols.pending);
    expect(timers).not.toHaveBeenCalled();
    await new Promise((resolve) => setTimeout(resolve, motion.intervalMs * 2));
    expect(unicode.frames).toHaveLength(1);
    expect(ascii.frames).toHaveLength(1);
  });

  it.each(['NO_MOTION', 'REDUCE_MOTION'])(
    'honors %s independently of ASCII mode',
    (environment) => {
      vi.stubEnv(environment, '1');
      const timers = vi.spyOn(globalThis, 'setInterval');
      expect(render(<Spinner />).lastFrame()).toBe(symbols.pending);
      expect(render(<Spinner ascii />).lastFrame()).toBe(asciiSymbols.pending);
      expect(timers).not.toHaveBeenCalled();
    },
  );

  it('allows a custom static frame with independent label appearance', () => {
    const output = render(
      <Spinner
        animate={false}
        staticFrame="wait"
        color={null}
        label="Working"
        labelColor="cyan"
        dimLabel={false}
      />,
    );

    expect(output.lastFrame()).toBe('wait Working');
  });

  it('stops and restarts motion when animate changes', async () => {
    const start = vi.spyOn(globalThis, 'setInterval');
    const stop = vi.spyOn(globalThis, 'clearInterval');
    const output = render(<Spinner />);
    await new Promise((resolve) => setTimeout(resolve, motion.intervalMs * 2));
    expect(output.frames.length).toBeGreaterThan(1);
    expect(start).toHaveBeenCalledTimes(1);
    output.rerender(<Spinner animate={false} />);
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(output.lastFrame()).toBe(symbols.pending);
    expect(stop).toHaveBeenCalledTimes(1);
    const staticFrames = output.frames.length;
    await new Promise((resolve) => setTimeout(resolve, motion.intervalMs * 2));
    expect(output.frames).toHaveLength(staticFrames);
    output.rerender(<Spinner />);
    await new Promise((resolve) => setTimeout(resolve, motion.intervalMs * 2));
    expect(start).toHaveBeenCalledTimes(2);
    expect(output.frames.length).toBeGreaterThan(staticFrames + 1);
    output.unmount();
    expect(stop).toHaveBeenCalledTimes(2);
  });

  it('updates static glyphs and appearance at runtime without a timer', async () => {
    const timers = vi.spyOn(globalThis, 'setInterval');
    const output = render(<Spinner animate={false} color="cyan" label="Loading" />);
    output.rerender(
      <Spinner
        animate={false}
        ascii
        color={null}
        labelColor={null}
        dimLabel={false}
        label="Loading"
      />,
    );
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(output.lastFrame()).toBe(`${asciiSymbols.pending} Loading`);
    output.rerender(<Spinner animate={false} staticFrame="..." label="Loading" />);
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(output.lastFrame()).toBe('... Loading');
    expect(timers).not.toHaveBeenCalled();
  });
});
