# Page anatomy and screen layouts

## The stable Page frame

The library's Page is an intentional full-screen visual standard. Preserve a single outer round frame, then six functional bands inside it:

1. **Title and scope:** app mark/name; object count; current user, environment or namespace; actionable alert and update/refresh state.
2. **Context/filter band:** space or the filter input when active. Opening a filter should not push every other region down unexpectedly.
3. **Tabs when needed:** only closely related views of the same task, not unrelated destinations.
4. **Primary body:** the actual data, form, log or detail view. Most screen height should go here.
5. **Position counter:** selected row count or scroll position, kept unobtrusive.
6. **Footer hints:** usable actions for the current keyboard focus.

Use no tab band on a detail screen without tabs. Keep the app's title row constant as the user opens a record; the record's own title belongs at the start of the body. Do not let changing numerical counts shift the location of the whole header.

The Page is the sole full-screen exterior border. Add `Panel` boundaries only for independently controlled regions. Use blank space, a muted section heading or a subtle rule before drawing yet another box.

## Canonical screen choices

| Pattern | Choose when | Ink UI composition | Narrow form |
| --- | --- | --- | --- |
| List → detail | Users scan items and inspect one | `Page`, `SelectableRow`, `KeyValue` | Single list, Enter opens detail, Back returns |
| List + inspector | Users repeatedly compare selections with a preview | `Page`, `Columns`, optional `Panel` | Hide preview; open selected inspector on demand |
| Section tabs | Several related datasets share one task | `Page` + `Tabs` + body | Retain active tab, fold inactive labels where possible |
| Data table | Users compare aligned structured fields | `Page` + `Table` | Preserve essential columns, turn extra fields into detail |
| Monitoring dashboard | Users watch several concurrent signals | `Page` + selective `Columns`/`Panel` | One widget at a time or vertical priority stack |
| Log/detail reader | Reading dominates scanning | `Page` + `ScrollView` | One region with clear scroll position |
| Command launcher | Search action, choose, return | `CommandPalette` as an overlay | Fits a bounded viewport; shrink preview first |
| Form or setup wizard | Each decision depends on earlier values | `Stepper` and input components | One step and one primary action at a time |

For hierarchical navigation, use a drill-down stack when the current and preview columns cannot both be legible. For a temporary picker launched from a shell, prefer bounded inline interaction to a full-screen frame unless there is a real persistent workspace.

## Width/height ladder

These are design review scenarios, not rigid framework breakpoints.

- **120 columns or wider:** show primary and supporting regions if both advance the task. A navigator is secondary; the content body should not get less useful just to display more panels.
- **80×24:** standard reference viewport. Usually a primary list plus a narrow detail, or a single body with tabs. Pay attention to headers/footers consuming a meaningful fraction of 24 rows.
- **60–79 columns:** single-pane design. Drop preview, move metadata into a detail page, and shorten footer hints while preserving help and back.
- **Below the actual tested minimum:** display a stable, readable “terminal too small” state with required dimensions and a viable quit path. Avoid clipping controls offscreen.

Prioritize reductions: secondary decoration → low-priority table columns → preview pane → sidebar. Never hide the only way to see a critical error or confirm a destructive action. Every item hidden from the main view must remain available on a detail view or another intentional route.

## Text-only illustration of list → detail

Wide: title/context above; selectable records occupy the left majority; a right detail region shows facts for the current row; a single footer explains focus and actions.

Narrow: title/context above; one selected list row and count; Enter opens a full-width detail screen; Back returns to the same list selection and filter. The user never loses their place merely because the terminal was resized.

## Layout constraints

- Stable pane positions enable spatial memory. Do not reorder them as data changes.
- If two regions can independently scroll or accept keys, mark which is focused and describe how to switch focus.
- On frequently refreshed screens, keep the selected record stable by ID; do not jump the highlight to the first row after updates.
- Avoid changing the frame between loading, populated, empty and error modes.
- Long row text normally truncates; detail reading can wrap.
- Specify both width and height requirements. An 80-column preview with only 12 rows may be less useful than a single-pane list.
- Footer hints and counters need a width budget; do not assume they fit on one line without checking.

