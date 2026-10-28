# Keyboard and focus contracts

The important design property is *one owner per keystroke*. Ink UI has presentational components and controls/hooks that claim terminal input. A screen that lets both the root and a focused prompt process Escape can accidentally go back twice. Design every focus transition before describing visual polish.

## App-wide house model

- Outside text entry, `q` quits from any depth. `Ctrl+C` also interrupts/quits according to the host's terminal contract. `q` in a text field is a literal character.
- `Esc` and Backspace peel exactly one locally owned layer: leave input focus, close overlay, return from detail, clear retained filter, then do nothing at the root. They do not unpredictably quit the app.
- `?` opens the help/legend where it does not conflict with text entry. Help must explain keys by active screen and mode, not merely list every possible shortcut without context.
- A focused text field receives typing and editing keys. Root navigation and global hotkeys stand down while it owns those keys.
- `Select`, `MultiSelect`, `ScrollView` and `CommandPalette` own their interaction while active. Avoid two simultaneous claimants for arrows, Enter or Escape.
- `useAppKeys` represents one root-level back/quit policy. `useTabs` and `useListCursor` represent predictable navigation in their respective regions.
- The palette is an overlay with one input owner; the app selects an available opening chord, and closes/returns focus predictably.

Existing hosts may have established conventions that supersede this house style. Describe the deliberate departure and keep each key's meaning consistent across that host.

## Navigation choices

| Need | Interaction |
| --- | --- |
| Move through list | Up/Down; optional j/k outside typing; list ends normally clamp |
| Switch related tabs | Tab/Shift+Tab or Left/Right where available; tabs wrap |
| Open detail | Enter on selected row; return with Escape/Backspace |
| Switch a few panes | Tab/Shift+Tab or direct numeric targets |
| Scroll long text | Focus the `ScrollView`; visible position indicator; allow exit from scroll focus |
| Search within records | `/` enters a filter-edit mode |
| Discover all actions | `?` help; palette for action-rich workflows |
| Pick multiple values | Space toggles, submit key confirms, escape cancels as documented |

Distinguish search-in-document (jump to matches) from list filtering (reduce result set). Keep a visible count for match/filtered results. Clearing a filter should not also throw the user back from the current screen.

## Filter interaction

Ink UI's `useFilterMode` separates *typing* from *retained filter*. Design them as different states:

1. Enter typing mode with `/`. The filter line becomes an editable region; text characters type rather than invoke app hotkeys.
2. Pressing Enter or Escape from typing leaves the term applied and returns the character keys to app actions. Do not discard an entered term just because focus left the field.
3. `Ctrl+U` clears a term while staying in the editing region; entering `/` again allows further editing.
4. A later back action in the host's peel may clear the retained filter after overlays and detail views are closed.
5. Empty results should say what was filtered, how many matched and how to clear or modify it.

## Focus indicators

Select one strong non-color cue and, if useful, a color reinforcement: a marked focused panel title, border weight, reverse-video selection or a consistent pointer. A selection is not the same as checkmarked multi-selection. Dim/background tint alone is insufficient.

## Layer and dialog rules

- Only one modal or command palette at a time. Its title and hints must make the mode evident without relying on background dimming.
- Show the cancel route, the action route and what happens to unsaved input.
- After a dialog closes, restore the previous cursor/focus and list viewport.
- For a destructive action, name the affected target and scope. Low-risk changes may be undoable; irreversible production actions deserve typed scope confirmation.
- Never allow a success toast to stand in for the complete result of a high-impact operation.

## Multi-step flow

`Stepper` is a wizard, not another owner of global quitting. Show current step, completed steps, remaining count, active input and previous/next/cancel routes. Validation messages appear next to the decision that needs correction. If a step performs async validation, make the pending state visible and prevent ambiguous duplicate submits. Review a consequential action before completion; preserve values when stepping backward.

## Footer grammar

Keep the reading order consistent: navigation, no more than three immediate page actions, mode switches, Back when nested, Help, Quit. Avoid describing keys that are currently unavailable. Under narrow widths show a smaller truthful set and retain a route to complete help.

## Common failures

- Escape closes both a prompt and its parent detail screen.
- `q` quits while the user meant to type a character in a filter.
- A selected row moves under the user's cursor after live data refresh.
- Filtering loses the original viewport and selection without need.
- Help lists a key that currently belongs to a different input owner.
- A back action from the root suddenly quits, contrary to other screens.

