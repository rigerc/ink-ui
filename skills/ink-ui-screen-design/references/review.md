# Screen specification and critique checklist

A useful design answer names the task, recommends one composition, and can be translated into a consistent Ink UI screen without inventing the interaction model.

## Screen specification format

1. **Purpose:** user, task, primary object and desired end state.
2. **Workflow:** scan → choose → inspect → act; monitor → investigate; filter → run; or compose → validate → submit.
3. **Surface:** inline prompt, persistent full-screen Page, single-pane drill-down, or temporary overlay. Explain why.
4. **Anatomy:** ordered regions with clear primary and supporting roles; map them to existing Ink UI components by name.
5. **Visual hierarchy:** answer first, context second, controls/status last; identify tokens and any focused marker.
6. **Focus/keys:** which region owns input, what Enter/Back/quit do, how help is reached, and what happens to incomplete text.
7. **Responsive ladder:** wide (120+), standard (80×24), narrow (~60), actual minimum; what hides and how it is recovered.
8. **States:** entry/loading, populated, empty, refreshing, partial/stale, error, confirmation, success, and too-small.
9. **Acceptance checks:** concrete observations that establish the screen is usable.

A text-only wireframe is useful when it makes the layout unmistakable. It should label regions, not pretend to be an exact Ink rendering or output code.

## Canonical critique order

| Priority | Problem | Evidence to seek |
| --- | --- | --- |
| Critical | Cannot complete task, dangerous action, misleading status | No recovery, unclear target, unconfirmed destructive effect |
| High | Keybinding conflict or lost context | Escape acts twice, text entry fires hotkeys, list jumps on refresh |
| High | Narrow terminal breaks interaction | Hidden controls, unusable column widths, invisible focused field |
| Medium | Important information difficult to scan | Status buried in dim text, rows wrapped inconsistently |
| Medium | Missing loading/empty/error state | Blank screen, no retry, stale data looks current |
| Medium | Excess chrome or redundant state | Nested borders, repeated symbols, badges everywhere |
| Low | Spacing/label refinement | Inconsistent gutters, redundant titles, unstable hint order |

Tie each issue to the user-visible failure and the specific recommendation. “Too cluttered” alone is not a finding; “two nested decorative Panel borders plus Page frame reduce readable row width at 80 columns” is.

## Size pressure test

At 120 columns, can the user still identify the primary action when secondary panels appear? At 80×24, are footer controls and title stable while the body has enough rows to scan? At 60 columns, is the result a usable one-pane view rather than three narrow fragments? Below the declared minimum, does the fallback state explain resizing and allow exiting?

For every hidden column or preview, identify where the data moves: detail page, toggled pane, active tab, or on-demand inspector. Removing the only place a field can be seen is not responsive design.

## Focus pressure test

Write down the focus owner for each relevant state: normal list, filter editing, retained filter, detail view, scroll region, modal, palette, wizard, and text input. Simulate a single Escape and a single q in each. Nothing should process one key twice; ordinary typing must never trigger a navigation shortcut.

## Color and accessibility pressure test

Imagine the frame without color or Unicode. Is the active tab still recognizable? Are success/failure different? Does an error still explain what went wrong? Can the user complete essential actions with keyboard only? Is motion unnecessary for knowing whether work is ongoing? Is a linear mode recommended where a screen reader cannot reliably track redraws?

## Ink UI-specific review reflexes

- There is one Page frame for a full-screen workspace, not Page-inside-Page.
- Table columns match their pane's actual width and degrade intentionally.
- SelectableRow, Select and MultiSelect are not treated as interchangeable.
- Tabs, list cursor and global app keys have consistent owners.
- Filter typing versus retained filtering is understandable.
- The app's scope and freshness remain visible after entering detail.
- Footer hints follow one reading order and only list currently valid keys.
- Semantic tokens match meanings; solid pills are not used for routine categories.
- Skeletons appear before first data, not after refresh starts.
- Real errors remain accessible after any short toast disappears.

## Completion criteria

The review is complete only when the answer provides a recommended screen structure, at least one concrete change per significant issue, an explicit narrow-screen fallback, a focus contract, and a non-color state check. Keep the response design-only unless implementation is separately requested.

