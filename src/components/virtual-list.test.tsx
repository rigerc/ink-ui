import React, {createRef} from 'react';
import {render} from 'ink-testing-library';
import {describe, expect, it} from 'vitest';
import {VirtualList, ensureVisible, type VirtualListHandle} from './virtual-list.js';

const data = Array.from({length: 30}, (_, index) => 'item ' + index);

describe('VirtualList', () => {
  it('renders a bounded window around an initial selection', () => {
    const frame =
      render(
        <VirtualList items={data} height={4} selectedIndex={20} renderItem={(item) => item} />,
      ).lastFrame() ?? '';

    expect(frame).toContain('item 20');
    expect(frame).not.toContain('item 10');
    expect(frame).not.toContain('item 29');
    expect(frame).toContain('/ 30');
  });
  it('keeps the cursor visible at either boundary', () => {
    expect(ensureVisible(0, 20, 30, 4)).toBe(17);
    expect(ensureVisible(17, 1, 30, 4)).toBe(1);
    expect(ensureVisible(100, -1, 30, 4)).toBe(26);
    expect(ensureVisible(0, 0, 0, 4)).toBe(0);
  });
  it('supports an empty state without a phantom row', () => {
    expect(
      render(<VirtualList items={[]} height={5} renderItem={(x: string) => x} />).lastFrame(),
    ).toContain('No items');
  });
  it('exposes scrollToIndex without owning keyboard input', async () => {
    const ref = createRef<VirtualListHandle>();

    const ui = render(
      <VirtualList ref={ref} items={data} height={3} renderItem={(item) => item} />,
    );

    ref.current!.scrollToIndex(28);
    await new Promise((resolve) => setTimeout(resolve, 40));
    expect(ui.lastFrame()).toContain('item 28');
    expect(ui.lastFrame()).not.toContain('item 0\n');
  });
});
