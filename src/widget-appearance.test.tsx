import {Box} from 'ink';
import {render} from 'ink-testing-library';
import {describe, expect, it, vi} from 'vitest';
import {
  ConfirmInput,
  FooterHints,
  SelectableRow,
  Spinner,
  StatusMessage,
  type WidgetColor,
} from './index.js';

const pause = () => new Promise((resolve) => setTimeout(resolve, 60));

function InlineWidgets({color}: {color: WidgetColor}) {
  return (
    <Box width={48} flexDirection="column">
      <SelectableRow active marker=">" indent={0} markerColor={color} textColor={color}>
        [x] Selected skill
      </SelectableRow>
      <Spinner
        ascii
        animate={false}
        color={color}
        labelColor={color}
        dimLabel={false}
        label="Scanning workspace"
      />
      <StatusMessage icon="+" color={color} textColor={color}>
        Saved
      </StatusMessage>
      <FooterHints
        hints={[['Space', 'select']]}
        page="nested"
        backKey="Esc"
        keyColor={color}
        labelColor={color}
        dimLabels={false}
        columnGap={1}
      />
    </Box>
  );
}

describe('host appearance composition', () => {
  it('changes colors without changing ASCII symbols, focus or selection content', () => {
    const app = render(<InlineWidgets color="#FFB000" />);
    const before = app.lastFrame();
    app.rerender(<InlineWidgets color={null} />);
    expect(app.lastFrame()).toBe(before);
    expect(app.lastFrame()).toContain('> [x] Selected skill');
    expect(app.lastFrame()).toContain('o Scanning workspace');
    expect(app.lastFrame()).toContain('+ Saved');
    expect(app.lastFrame()).toContain('Esc back');
    expect(app.lastFrame()).not.toMatch(/[⌫❯⠋✓]/u);
  });

  it('retains an explicitly chosen confirmation when only appearance changes', async () => {
    const onConfirm = vi.fn();

    const app = render(
      <ConfirmInput arrowKeys defaultChoice="cancel" color="#FFB000" onConfirm={onConfirm} />,
    );

    await pause();
    app.stdin.write('\u001b[C');
    await pause();
    expect(app.lastFrame()).toContain('(Y/n)');
    app.rerender(
      <ConfirmInput
        arrowKeys
        defaultChoice="cancel"
        color={null}
        dimColor={false}
        onConfirm={onConfirm}
      />,
    );
    await pause();
    expect(app.lastFrame()).toContain('(Y/n)');
    app.stdin.write('\r');
    await pause();
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
