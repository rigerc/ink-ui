import {describe, it, expect} from 'vitest';
import {Box, Text} from 'ink';
import {render} from 'ink-testing-library';
import stringWidth from 'string-width';
import {colors} from '../tokens.js';
import {SelectableRow, resolveSelectableRowColors} from './selectable-row.js';

describe('SelectableRow', () => {
  it('marks the active row and leaves the others plain', () => {
    const {lastFrame} = render(
      <Box flexDirection="column">
        <SelectableRow active>one</SelectableRow>
        <SelectableRow>two</SelectableRow>
      </Box>,
    );

    const [first, second] = (lastFrame() ?? '').split('\n');
    expect(first).toContain('❯');
    expect(second).not.toContain('❯');
    expect(first).toBe('  ❯ one');
    expect(second).toBe('    two');
  });

  it.each(['>>>', '界'])('aligns active and inactive rows for marker %s', (marker) => {
    const {lastFrame} = render(
      <Box width={20} flexDirection="column">
        <SelectableRow active marker={marker} indent={1}>
          <Text wrap="truncate-end">{'x'.repeat(100)}</Text>
        </SelectableRow>
        <SelectableRow marker={marker} indent={1}>
          <Text wrap="truncate-end">{'y'.repeat(100)}</Text>
        </SelectableRow>
      </Box>,
    );

    const [active, inactive] = (lastFrame() ?? '').split('\n');
    const activeColumn = stringWidth(active!.slice(0, active!.indexOf('x')));
    const inactiveColumn = stringWidth(inactive!.slice(0, inactive!.indexOf('y')));
    expect(activeColumn).toBe(1 + stringWidth(marker) + 1);
    expect(inactiveColumn).toBe(activeColumn);
  });

  it('supports zero indent and number children', () => {
    const {lastFrame} = render(
      <SelectableRow active indent={0} marker=">">
        {42}
      </SelectableRow>,
    );

    expect(lastFrame()).toBe('> 42');
  });

  it('updates the marker and gutter when appearance props change', async () => {
    const {lastFrame, rerender} = render(<SelectableRow active>value</SelectableRow>);
    rerender(
      <SelectableRow active marker="界" indent={0} markerColor={null} textColor={null}>
        value
      </SelectableRow>,
    );
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(lastFrame()).toBe('界 value');
    rerender(
      <SelectableRow marker="界" indent={0}>
        value
      </SelectableRow>,
    );
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(lastFrame()).toBe('   value');
  });

  it('resolves default, explicit, and terminal foreground colors independently', () => {
    expect(resolveSelectableRowColors()).toEqual({markerColor: colors.info, textColor: undefined});
    expect(resolveSelectableRowColors('cyan', 'yellow')).toEqual({
      markerColor: 'cyan',
      textColor: 'yellow',
    });
    expect(resolveSelectableRowColors(null, null)).toEqual({
      markerColor: undefined,
      textColor: undefined,
    });
    expect(resolveSelectableRowColors(undefined, 'red')).toEqual({
      markerColor: colors.info,
      textColor: 'red',
    });
  });

  // A row long enough to overflow its container compresses every flexible
  // child, and the gutter is only four characters wide — so it used to lose a
  // column and drag the whole row one place left. Short fixtures never overflow
  // and so never caught it; the narrow wrapper here is load-bearing.
  it('keeps its gutter width when the content overflows the container', () => {
    const WIDTH = 40;

    const {lastFrame} = render(
      <Box width={WIDTH} flexDirection="column">
        <SelectableRow>
          <Text wrap="truncate-end">short</Text>
        </SelectableRow>
        <SelectableRow>
          <Text wrap="truncate-end">{'x'.repeat(200)}</Text>
        </SelectableRow>
      </Box>,
    );

    const lines = (lastFrame() ?? '').split('\n').filter(Boolean);
    const indents = lines.map((line) => line.length - line.trimStart().length);
    expect(new Set(indents).size).toBe(1);
  });

  it('keeps the active gutter aligned with inactive ones when overflowing', () => {
    const WIDTH = 40;

    const {lastFrame} = render(
      <Box width={WIDTH} flexDirection="column">
        <SelectableRow active>
          <Text wrap="truncate-end">{'y'.repeat(200)}</Text>
        </SelectableRow>
        <SelectableRow>
          <Text wrap="truncate-end">{'z'.repeat(200)}</Text>
        </SelectableRow>
      </Box>,
    );

    const lines = (lastFrame() ?? '').split('\n').filter(Boolean);
    // The active row spends two of its four gutter cells on "  ❯ ", so its
    // content starts at the same column as an inactive row's four spaces.
    const contentAt = lines.map((line) => line.search(/[yz]/));
    expect(contentAt.every((at) => at > 0)).toBe(true);
    expect(new Set(contentAt).size).toBe(1);
  });
});
