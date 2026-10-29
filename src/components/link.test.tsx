import React from 'react';
import {render} from 'ink-testing-library';
import {describe, expect, it} from 'vitest';
import {Link, supportsHyperlinks} from './link.js';

describe('Link', () => {
  it('renders a readable fallback without terminal hyperlink support', () => {
    expect(
      render(
        <Link url="https://example.org" hyperlinks={false}>
          Docs
        </Link>,
      ).lastFrame(),
    ).toContain('Docs (https://example.org)');
  });
  it('can suppress the fallback URL', () => {
    expect(
      render(
        <Link url="https://example.org" fallback="label" hyperlinks={false}>
          Docs
        </Link>,
      ).lastFrame(),
    ).toContain('Docs');
  });
  it('does not wrap unsafe schemes in control sequences', () => {
    const frame =
      render(
        <Link url="javascript:alert(1)" hyperlinks>
          Unsafe
        </Link>,
      ).lastFrame() ?? '';
    expect(frame).toContain('javascript:alert(1)');
    expect(frame).not.toContain('\u001b]8;;');
  });
  it('detects capability conservatively and honours explicit overrides', () => {
    expect(supportsHyperlinks({TERM: 'dumb'}, true)).toBe(false);
    expect(supportsHyperlinks({TERM: 'xterm', WT_SESSION: 'yes'}, false)).toBe(false);
    expect(supportsHyperlinks({FORCE_HYPERLINK: '1'}, false)).toBe(true);
    expect(supportsHyperlinks({FORCE_HYPERLINK: '0', WT_SESSION: 'yes'}, true)).toBe(false);
  });
});
