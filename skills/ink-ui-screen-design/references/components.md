# Choosing Ink UI components

Choose a component for the user's task rather than the opportunity to display it. Check `src/index.ts` / exported types before claiming a feature is absent; names here are design vocabulary rather than API signatures.

## Task-to-component map

| User task | Preferred building blocks | Design note |
| --- | --- | --- |
| Sustained full-screen session | `Page` | One consistent frame, persistent identity and scope |
| Short inline result or introduction | `Banner`, `Header` | Do not pay the height cost of a full Page |
| Compare many records | `Table` | Align columns, right-align quantities and prioritize essential fields |
| Navigate records to act later | `SelectableRow`, `useListCursor` | Cursor belongs to the host, row is presentational |
| Make one bounded selection | `Select` | Distinct from a persistent list browser |
| Select multiple options | `MultiSelect` | Show selected count, how to toggle, and submit/cancel |
| Switch related views | `Tabs`, `useTabs` | Active item needs underline/weight, not hue alone |
| Explore a single object | `KeyValue`, `ScrollView` | Favor readable detail fields over a one-record table |
| Show independent perspectives | `Columns`, `Panel` | Define focus transfer and an explicit single-pane fallback |
| Input a short value | `TextInput`, `EmailInput`, `PasswordInput` | Clear label, retained value, visible validation |
| Confirm a low-risk action | `ConfirmInput` | Make the safe default clear |
| Guided multi-step workflow | `Stepper`, `Step`, `StepperProgress`, `StepperNavigation` | Review before a consequential commit |
| Search within a list | `FilterBar`, `useFilterMode` | Treat typing and retained-filter states differently |
| Search and invoke app actions | `CommandPalette` | Topmost interaction layer with a clear no-results state |
| Show named status | `StatusMessage` | Inline and contextual |
| Make important failure persistent | `Alert` | State failure, affected scope and recovery |
| Confirm an ordinary success | `Toast` | Transient; never the sole record of a critical failure |
| Display category or event | `Badge`, `Pill` | Category and event have different visual intensities |
| First unknown data | `SkeletonRows`, `SkeletonBar` | Only until the initial result is known |
| Indeterminate work | `Spinner`, `LoadingScreen` | Label what is waiting; do not animate after completion |
| Measured work | `ProgressBar` | Only for known amounts |
| Compact guidance | `FooterHints` | Contextual, high-frequency controls first |
| Readable content list | `OrderedList`, `UnorderedList` | Not a substitute for interactive selection |

## Component boundaries that matter

`SelectableRow` is a visual affordance and does not own list key handling. `Select` and `MultiSelect` are self-contained interactive choices; do not use them as long-lived, continuously refreshing tables. `ScrollView` owns scrolling when active; nearby list shortcuts should be suspended. `Table` is best for aligned comparison, not prose paragraphs or editable forms.

`Page` frames the active screen. `Panel` frames a subordinate region only when its separation or focus carries meaning; a second decorative border inside Page is usually unnecessary. `Columns` is a relationship between data sources or list/detail, not a way to maximize the number of visible widgets. `Header` within the body should add local context rather than repeat the Page title.

A `Stepper` represents a sequential decision with validation. A small setting should not become a wizard just to use the component. `Switch`, `Toggle` and `ToggleSwitch` require a clear label and an explicit apply model: immediate, staged until Save, or read-only status.

## Dense content and overflow

- Prefer one line per record in scanning lists. Reserve wrapping for details, multi-line text, and exceptionally important content.
- In tables, decide column priority: ID/title and state first; optional description, timestamps and metadata can fold or hide.
- Long paths may need middle truncation so the final filename remains visible; preserve a way to reveal the full value.
- The list cursor, the chosen checkbox, and the keyboard focus are three different states. Do not represent all three with a single ambiguous highlight.
- Keep row gutters stable as icons, counts or badges appear and disappear.
- For tab counters not yet loaded, use an unknown marker rather than pretending a count of zero.
- Use `KeyValue` with a shared label width for detail facts; keep the values more visually prominent than labels.

## When not to use a component

Avoid `Alert` + `Toast` + red footer for the same problem. Avoid `Spinner`, `ProgressBar` and skeletons simultaneously for one operation. Avoid a `CommandPalette` to expose the only three actions the product offers. Do not rebuild Table, Tabs, Page, FooterHints, picker or Panel merely to change spacing or border characters.

See also [layouts](layouts.md) and [visual states](visual-states.md).

