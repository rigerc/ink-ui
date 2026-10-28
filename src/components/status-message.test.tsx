import React from 'react';
import {render} from 'ink-testing-library';
import {describe, it, expect} from 'vitest';
import {colors} from '../tokens.js';
import {getIconMode, setIconMode} from '../icon-mode.js';
import {statusVariant} from './status-variants.js';
import {StatusMessage, statusMessageAppearance} from './status-message.js';

describe('StatusMessage', () => {
  it('renders the message with the success glyph', () => {
    const {lastFrame} = render(<StatusMessage variant="success">Saved</StatusMessage>);

    const frame = lastFrame() ?? '';
    expect(frame).toContain('✓');
    expect(frame).toContain('Saved');
  });

  it('uses a distinct glyph per variant', () => {
    expect(render(<StatusMessage variant="error">x</StatusMessage>).lastFrame()).toContain('✗');
    expect(render(<StatusMessage variant="warning">x</StatusMessage>).lastFrame()).toContain('⚠');
    expect(render(<StatusMessage variant="info">x</StatusMessage>).lastFrame()).toContain('ℹ');
  });

  it('retains variant defaults unless overridden', () => {
    expect(statusMessageAppearance('success')).toEqual({
      ...statusVariant('success'),
      textColor: undefined,
    });
    expect(statusMessageAppearance('error', undefined, undefined, 'cyan')).toEqual({
      icon: statusVariant('error').icon,
      color: colors.error,
      textColor: 'cyan',
    });
  });

  it('resolves independent colors and terminal defaults', () => {
    expect(statusMessageAppearance('warning', '!', 'magenta', 'cyan')).toEqual({
      icon: '!',
      color: 'magenta',
      textColor: 'cyan',
    });
    expect(statusMessageAppearance('warning', undefined, null, null)).toEqual({
      icon: statusVariant('warning').icon,
      color: undefined,
      textColor: undefined,
    });
  });

  it('preserves Nerd Font variant glyphs with color overrides', () => {
    const previousMode = getIconMode();

    try {
      setIconMode('nerd');
      const expectedIcon = statusVariant('warning').icon;
      expect(statusMessageAppearance('warning', undefined, null).icon).toBe(expectedIcon);
      expect(
        render(
          <StatusMessage variant="warning" color={null}>
            Warning
          </StatusMessage>,
        ).lastFrame(),
      ).toContain(`${expectedIcon} Warning`);
    } finally {
      setIconMode(previousMode);
    }
  });

  it('keeps the message and custom shape when colors are disabled', () => {
    expect(
      render(
        <StatusMessage variant="error" icon="[failed]" color={null} textColor={null}>
          Build failed
        </StatusMessage>,
      ).lastFrame(),
    ).toBe('[failed] Build failed');
  });

  it('updates appearance at runtime and restores the variant glyph', async () => {
    const output = render(
      <StatusMessage icon="[ok]" color="cyan">
        Saved
      </StatusMessage>,
    );

    expect(output.lastFrame()).toBe('[ok] Saved');
    output.rerender(
      <StatusMessage variant="success" color={null} textColor="cyan">
        Saved
      </StatusMessage>,
    );
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(output.lastFrame()).toBe('✓ Saved');
  });
});
