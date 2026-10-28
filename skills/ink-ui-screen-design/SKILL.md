---
name: ink-ui-screen-design
description: Design, specify and critique terminal UI screens built with rigerc/ink-ui (@rigerc/ink-ui). Use when a request involves Ink UI page composition, layouts, panels, tables, lists, tabs, filters, keyboard navigation, prompts, wizards, status states, semantic tokens or screen review. This skill is design-only: provide rationale, component maps, screen specifications, text wireframes and review findings, not implementation code.
---

# Ink UI Screen Design

Design calm, useful terminal screens using the actual visual system of [rigerc/ink-ui](https://github.com/rigerc/ink-ui). This skill specializes general TUI screen-design principles for Ink UI's components, semantic tokens, page structure and interaction conventions. It is self-contained and does not require a separate general TUI skill to be installed.

**This is a design skill, not a coding skill.** Discuss component names and behavioral responsibilities as design vocabulary. Do not output TypeScript, React components, TSX, command-line setup instructions or implementation snippets unless the user explicitly switches to implementation.

## Route to the relevant design guidance

| Task | Reference |
| --- | --- |
| See current exported components, hooks, token keys and package compatibility | `references/generated-api.md` |
| Pick components without rebuilding existing primitives | `references/components.md` |
| Design Page regions, navigation hierarchy, multi-pane screens and narrow fallbacks | `references/layouts.md` |
| Specify focus, quit/back behavior, search, key hints, prompts and wizards | `references/interactions.md` |
| Apply token semantics, icon/ASCII choices, feedback and loading/error states | `references/visual-states.md` |
| Review an existing TUI, produce specifications and validate difficult states | `references/review.md` |

For a complete proposed screen, use all five references. For a focused question, load only what is relevant.

## Always decide these first

1. **User's loop:** what they scan, select, inspect, edit or confirm; which fact or action matters most.
2. **Surface:** a short inline interaction, a full-screen `Page` workspace, or a drill-down sequence. Do not frame a trivial confirmation as an entire dashboard.
3. **Information hierarchy:** primary content, supporting context, control hints and feedback. Give the primary task the largest useful region.
4. **Component ownership:** prefer shipped Ink UI components over bespoke presentations; distinguish presentational widgets from controls that listen for keys.
5. **Focus model:** one active region/keyboard claimant at a time, with an explicit way to return.
6. **Narrow behavior:** show the 120-column design, 80×24 form and approximately 60-column single-pane fallback. Declare the actual minimum rather than assuming 80 columns is universal.
7. **States:** first load, populated, refresh, empty, partial, stale/disconnected, error, success, confirmation and too-small.
8. **Accessibility:** meaning must survive absent color, Unicode fallback and reduced motion. A separately usable linear/plain interaction may be needed for screen-reader users.

## Ink UI house defaults

- One stable `Page` frame per full-screen active screen; no nested `Page` or redundant outer wrapper. Keep app identity, scope, freshness and available actions visible across list and detail states.
- `Page` follows title/context → filter row → optional tabs → body → position counter → contextual footer hints. Empty optional bands should collapse, not leave purposeless holes.
- The footer reads navigation → at most three local actions → mode switches → Back when nested → Help → Quit. On narrow screens, shorten nonessential hints, not the only route to help.
- Use `Columns` and `Panel` when multiple independent perspectives matter. Fold side content to drill-down or tabs as width shrinks; avoid three compressed unreadable columns.
- A persistent browser uses `SelectableRow` conceptually with `useListCursor`; a bounded pick-one prompt uses `Select`. They have different interaction contracts.
- `useTabs` wraps across tabs; `useListCursor` normally clamps at list ends. Text fields, `Select`, `ScrollView` and other interactive controls own their input while active. Global back/quit policy belongs at the app root.
- The Ink UI house key scheme: `q` quits when not typing, `Esc`/Backspace peel one owned layer, and `Esc` at the root has no quitting side effect. Always state when a field consumes character keys instead.
- Use shared semantic tokens, glyphs and spacing, rather than hand-picked unrelated colors. State needs a word, shape or weight independent of hue.
- Initial unknown content may show `SkeletonRows`/`SkeletonBar`; a refresh keeps last-known content and visibly reports updating, rather than replacing it with skeletons.
- The published token palette targets dark terminals. Do not claim native light-theme adaptation or full-screen screen-reader support.

## Deliverables

**When designing:** recommend a workflow shape, show a short labeled text wireframe when useful, map regions to library components, specify keys/focus and state transitions, describe 120/80/60-column behavior, and finish with concrete usability checks.

**When reviewing:** report problems by severity and affected task, cite the exact noisy, missing or confusing region, prescribe a precise component/interaction/layout change, and verify narrow, monochrome and error states. Avoid subjective adjectives without observable evidence.

## Authority and upkeep

The generated API inventory is maintained by `npm run update:skill`; see [maintenance](MAINTENANCE.md) for checks and automation. The library's current `AGENTS.md` owns its design contract; `src/index.ts` and exported types own component availability. The library README and `docs/` can trail source changes. This skill is grounded in the rigerc/ink-ui repository as inspected on 2026-10-28, and favors source/exported definitions when names, behaviors or counts diverge. When implementation is explicitly requested, verify against current exports first.

Inspired by the broader TUI screen-design skill and [gfargo/tui-design-skill](https://github.com/gfargo/tui-design-skill). This is design guidance, not a new library dependency.

