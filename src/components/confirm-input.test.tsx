import React from 'react';
import {render} from 'ink-testing-library';
import {describe, it, expect, vi} from 'vitest';
import {ConfirmInput} from './confirm-input.js';

const CR = String.fromCharCode(13); // Enter
const delay = (ms = 60) => new Promise((resolve) => setTimeout(resolve, ms));

describe('ConfirmInput', () => {
  it('shows the default choice capitalised', () => {
    expect(render(<ConfirmInput defaultChoice="confirm" />).lastFrame()).toContain('(Y/n)');
    expect(render(<ConfirmInput defaultChoice="cancel" />).lastFrame()).toContain('(y/N)');
  });

  it("calls onConfirm when 'y' is pressed", async () => {
    const onConfirm = vi.fn();
    const {stdin} = render(<ConfirmInput onConfirm={onConfirm} />);
    stdin.write('y');
    await delay();
    expect(onConfirm).toHaveBeenCalled();
  });

  it("calls onCancel when 'n' is pressed", async () => {
    const onCancel = vi.fn();
    const {stdin} = render(<ConfirmInput onCancel={onCancel} />);
    stdin.write('n');
    await delay();
    expect(onCancel).toHaveBeenCalled();
  });

  it('Enter selects the default choice', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    const {stdin} = render(
      <ConfirmInput defaultChoice="cancel" onConfirm={onConfirm} onCancel={onCancel} />,
    );

    stdin.write(CR);
    await delay();
    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('arrows are opt in and leave the default choice unchanged', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const {stdin, lastFrame} = render(<ConfirmInput onConfirm={onConfirm} onCancel={onCancel} />);
    stdin.write('\u001B[D');
    await delay();
    expect(lastFrame()).toContain('(Y/n)');
    stdin.write(CR);
    await delay();
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('arrows change the visible and submitted choice without submitting', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    const {stdin, lastFrame} = render(
      <ConfirmInput arrowKeys onConfirm={onConfirm} onCancel={onCancel} />,
    );

    for (const arrow of ['\u001B[D', '\u001B[A']) {
      stdin.write(arrow);
      await delay();
      expect(lastFrame()).toContain('(y/N)');
    }

    expect(onCancel).not.toHaveBeenCalled();
    stdin.write(CR);
    await delay();
    expect(onCancel).toHaveBeenCalledOnce();

    for (const arrow of ['\u001B[C', '\u001B[B']) {
      stdin.write(arrow);
      await delay();
      expect(lastFrame()).toContain('(Y/n)');
    }

    expect(onConfirm).not.toHaveBeenCalled();
    stdin.write(CR);
    await delay();
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('resets the arrow choice when defaultChoice changes', async () => {
    const output = render(<ConfirmInput arrowKeys defaultChoice="cancel" />);
    output.stdin.write('\u001B[C');
    await delay();
    output.rerender(<ConfirmInput arrowKeys defaultChoice="confirm" />);
    await delay();
    output.rerender(<ConfirmInput arrowKeys defaultChoice="cancel" />);
    await delay();
    expect(output.lastFrame()).toContain('(y/N)');
  });

  it('keeps y/n immediate with arrow navigation enabled', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    const {stdin} = render(
      <ConfirmInput arrowKeys defaultChoice="cancel" onConfirm={onConfirm} onCancel={onCancel} />,
    );

    stdin.write('Y');
    await delay();
    stdin.write('N');
    await delay();
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('does not handle keys while disabled', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    const {stdin, lastFrame} = render(
      <ConfirmInput isDisabled arrowKeys onConfirm={onConfirm} onCancel={onCancel} />,
    );

    for (const key of ['y', 'n', '\u001B[D', CR]) stdin.write(key);
    await delay();
    expect(lastFrame()).toContain('(Y/n)');
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('leaves Escape, q, and backspace to the host', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const {stdin} = render(<ConfirmInput arrowKeys onConfirm={onConfirm} onCancel={onCancel} />);

    for (const key of ['\u001B', 'q', '\u007F', '\b']) stdin.write(key);
    await delay();
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('preserves the choice cue when appearance changes at runtime', async () => {
    const output = render(<ConfirmInput arrowKeys color="cyan" dimColor={false} />);
    output.stdin.write('\u001B[D');
    await delay();
    output.rerender(<ConfirmInput arrowKeys color={null} />);
    await delay();
    expect(output.lastFrame()).toContain('(y/N)');
  });
});
