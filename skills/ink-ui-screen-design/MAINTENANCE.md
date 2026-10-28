# Keeping the Ink UI screen design skill current

The skill is maintained in two layers:

1. Human-authored design guidance: SKILL.md and the five task-oriented references.
2. Source-derived factual inventory: references/generated-api.md, regenerated with npm run update:skill.

The inventory is derived from public exports in src/index.ts, exported token
families in src/tokens.ts, and package/peer metadata in package.json.
It is deterministic: repeating generation against unchanged source produces
no diff. It does not infer design advice from implementation details.

## Local commands

- npm run update:skill — regenerate the API reference.
- npm run check:skill — verify generated content, Markdown links, and
  backticked exported components/hooks/types in human-authored references.
- node scripts/sync-skill.mjs --check-generated — check only the generated
  inventory; useful when a library change removes an API but the corresponding
  design guidance still needs review.

## Automation

.github/workflows/update-skill.yml runs on relevant main-branch changes,
weekly, and by manual dispatch. It regenerates only generated-api.md, then
creates or updates the dedicated automation/update-ink-ui-skill PR when
the inventory differs from main. Existing authored guidance is never rewritten.

The automated PR includes an advisory audit result. Normal PR CI enforces
npm run check:skill, so removing an exported component referenced by the skill
requires a deliberate human-authored update before merging.

## GitHub setup

The workflow requires permission to create pull requests. Enable the
repository setting allowing GitHub Actions to create PRs, or configure
SKILL_AUTOMATION_TOKEN with a least-privilege GitHub App / bot credential
that has Contents and Pull requests write permission. A separately
configured bot credential also allows normal pull_request CI to run on
automation-created PRs; PRs created using the default GITHUB_TOKEN do not
normally trigger other Actions workflows.

Do not give the updater blanket permission to modify design guidelines.
No auto-merge is configured.

## What is not automated

Changes in the meaning or interaction behavior of existing components,
recommended layout patterns, accessibility guidance, or keyboard ownership
need a design review. Adding an export updates the inventory; it does not
automatically make that component the recommended choice.

Installed copies of the skill do not update when GitHub changes. Distribute
a new skill bundle separately if consumers need automatic installation updates.
