# Visual language and states

Ink UI's design system is opinionated. Use its semantic tokens and established shapes rather than treating the package as a collection of unrelated widgets. The shipped palette is tuned to a dark ground; do not promise automatic light-theme contrast.

## Visual hierarchy

The default foreground is the answer: a record title, value, verdict or primary instruction. `colors.secondary` provides neighboring context. `colors.muted` is furniture such as units, age, column headings and keyboard labels. `colors.dim` belongs to rules and separators, not essential prose. An active place uses `colors.accent` sparingly; two accent elements on the same record compete with each other.

Use whitespace before a decorative border. A single frame and a few purposeful regions are clearer than boxes nested within boxes. For data-heavy lists, favor one stable row per record, visible alignment and short scan paths; for forms and confirmation, give labels and choices breathing room.

## Semantic colors and symbols

| Role | Token family | Non-color anchor |
| --- | --- | --- |
| Active location | `colors.accent` | Underline, bold label, pointer or focus mark |
| Success | `colors.success` | A success word or check glyph |
| Failure | `colors.error` | An error word or cross glyph |
| Warning | `colors.warning` | Warning word or caution glyph |
| Information | `colors.info` | Informational label |
| Pending | `colors.pending` | Queued/waiting text or open-circle glyph |
| Grouping | `colors.group` | Heading and clear group structure |
| Ticket and PR identifiers | `colors.ticket`, `colors.pr` | The actual key/number |
| Links | `colors.link` | Recognizable URL/path/action text |
| Diff quantities | `colors.added`, `colors.removed` | Explicit + and - quantities |
| Selection | `colors.selection` | Pointer and visible focus weight |

Never use red simply to mean “high priority”; reserve the error color for failure. Priority should be distinguished by shape and lightness. Identifier coloring does not replace a readable ID, and external-system state colors need text reinforcement. Use `symbols`, `asciiSymbols`, `borders` and `motion` rather than inventing a competing glyph vocabulary. Nerd Font icons are an optional mode, not a safe default.

## Pills, badges and attention

- **Solid `Pill`:** something happened; a recent event or result deserves notice.
- **Soft:** a permanent classification such as task/bug/category; suitable for frequent repetition.
- **Outline:** quiet classification where even a soft fill is too much.
- **Tonal:** small application chrome such as a count or tab chip; stronger tonal treatment indicates the active place.
- **Badge:** compact bracket-like label where a pill would be visually too heavy.

Do not put every ID and status inside a saturated pill. Use one color cue and one non-color cue for a piece of state. Repeating a checkmark, green color, success pill and PASS label encodes one fact four times.

## Screen states

| State | What the user should see | Preferred design |
| --- | --- | --- |
| First entry | Immediate page shape and obvious starting action | Persistent Page/context and primary affordance |
| First loading | What data is expected, where it will appear | `SkeletonRows` / `SkeletonBar` for unknown content; labeled waiting |
| Refreshing | Existing records, visible updating state | Retain last rows and counts; no return to skeletons |
| Empty | Which scope has no items and what to do | Clear empty-scope line and action/filter recovery |
| Partial | Usable loaded records plus explicit missing subset | Show count/scope of unavailable data and retry |
| Error | Operation, cause if known, and next step | `StatusMessage` or persistent `Alert` |
| Disconnected/stale | Last-known data identified as stale, age and reconnect route | Keep data but label freshness honestly |
| Success | What was changed and where to inspect it | Brief toast/status, or durable receipt for important work |
| Confirmation | Object/scope, consequence, safe default, cancel route | Focused single decision |
| Terminal too small | Required size and available quit/help action | Stable fallback; no broken clipped frame |

A spinner is for indeterminate progress; a progress bar is for measurable completion. If an operation takes time, say what work is underway and provide cancellation where safe. Avoid a full `LoadingScreen` if the user can continue reading existing data.

## Accessibility and fallback

- Pair state colors with a word, glyph or hierarchy cue; confirm they still mean something under `NO_COLOR` and without ANSI color.
- Prefer default text-safe symbols. Supply ASCII alternatives for uncertain Unicode widths, fonts and environments.
- Do not blink essential information; provide a reduced/no-motion path for spinners and skeleton shimmer.
- Maintain useful keyboard navigation without a mouse.
- A redrawing full-screen TUI is not automatically screen-reader accessible. For users who need it, recommend a separately reachable linear/plain interaction with labeled values, numbered choices and append-only progress. Color independence alone does not solve focus and continuous redraw problems.
- Do not claim Ink UI ships a light-theme token set when the current published system is tuned to dark terminals.

## Clutter audit

Count frame nesting depth, signals that repeat the same state, markers printed on every row, and cells spent on borders/chrome rather than task information. Recommend exactly which decoration can be removed without losing meaning. A selected-row pointer on every row does not signify selection; a colored badge on every cell makes no cell important.

