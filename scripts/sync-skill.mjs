// Keep the skill's factual API reference in sync with this repository.
// Human-authored screen design guidance is intentionally never regenerated.

import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("../", import.meta.url))
const generatedPath = "skills/ink-ui-screen-design/references/generated-api.md"
const skillPath = "skills/ink-ui-screen-design/"

const authoredFiles = [
  "SKILL.md",
  "references/components.md",
  "references/layouts.md",
  "references/interactions.md",
  "references/visual-states.md",
  "references/review.md",
]

const tick = String.fromCharCode(96)
const read = (path) => readFileSync(join(root, path), "utf8")
const code = (value) => tick + value + tick

function publicExports() {
  const source = read("src/index.ts")
  const records = []

  for (const match of source.matchAll(/export\s+(type\s+)?\{([^}]+)\}\s+from\s+"([^"]+)"/g)) {
    const isType = Boolean(match[1])
    const module = match[3].replace(/^\.\//, "").replace(/\.js$/, "")

    const sourcePath = ["src/" + module + ".tsx", "src/" + module + ".ts"]
      .find((path) => existsSync(join(root, path)))

    if (!sourcePath) throw new Error("Missing public export source for " + match[3])

    for (const item of match[2].split(",")) {
      const name = item.trim().split(/\s+as\s+/).pop()

      if (name) records.push({ name, isType, sourcePath, module })
    }
  }

  if (records.length === 0) throw new Error("No named exports found in src/index.ts")

  return records
}

function tokenKeys(name) {
  const source = read("src/tokens.ts")
  const pattern = new RegExp("export const " + name + "\\b[^=]*=\\s*\\{([\\s\\S]*?)^\\}", "m")
  const match = source.match(pattern)

  if (!match) throw new Error("Cannot inspect exported token family: " + name)

  const keys = []

  for (const entry of match[1].matchAll(/^  ([A-Za-z][A-Za-z0-9]*):/gm)) {
    keys.push(entry[1])
  }

  return keys
}

function listRows(records) {
  return records
    .sort((a, b) => a.name.localeCompare(b.name, "en"))
    .map((entry) => "| " + code(entry.name) + " | [" + code(entry.sourcePath) + "](../../../" + entry.sourcePath + ") |")
}

function renderReference() {
  const pkg = JSON.parse(read("package.json"))
  const records = publicExports()
  const values = records.filter((entry) => !entry.isType)
  const components = values.filter((entry) => /^[A-Z][a-z]/.test(entry.name))
  const hooks = values.filter((entry) => /^use[A-Z]/.test(entry.name))
  const other = values.filter((entry) => !/^[A-Z][a-z]/.test(entry.name) && !/^use[A-Z]/.test(entry.name))
  const types = records.filter((entry) => entry.isType)
  const tokenFamilies = values.filter((entry) => entry.module === "tokens")

  const peers = Object.entries(pkg.peerDependencies ?? {})
    .map(([name, range]) => code(name + " " + range))
    .join(", ")

  const lines = [
    "# Generated Ink UI API reference",
    "",
    "> Automatically derived from source. Do not edit by hand. Run " + code("npm run update:skill") + " to refresh.",
    "> Design recommendations in the other references remain human-maintained.",
    "",
    "**Package:** " + code(pkg.name) + " · **Version:** " + code(pkg.version) + " · **Peers:** " + peers,
    "",
    "## Exported components",
    "",
    "| Export | Source |",
    "| --- | --- |",
    ...listRows(components),
    "",
    "## Exported behavior hooks",
    "",
    "| Export | Source |",
    "| --- | --- |",
    ...listRows(hooks),
    "",
    "## Other public values",
    "",
    "| Export | Source |",
    "| --- | --- |",
    ...listRows(other),
    "",
    "## Exported types",
    "",
    "| Export | Source |",
    "| --- | --- |",
    ...listRows(types),
    "",
    "## Token families and keys",
    "",
    "| Export | Keys |",
    "| --- | --- |",
  ]

  for (const family of tokenFamilies) {
    lines.push("| " + code(family.name) + " | " + tokenKeys(family.name).map(code).join(", ") + " |")
  }

  lines.push("", "This file reports public availability, not a recommendation to use every export on every screen.", "")

  return lines.join("\n")
}

function validateLinks(path, problems) {
  const content = read(path)

  for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].split("#")[0]

    if (!target || /^(https?:|mailto:)/.test(target)) continue

    const absolute = resolve(root, dirname(path), target)

    if (!absolute.startsWith(root + sep) || !existsSync(absolute)) {
      problems.push(path + ": missing local link " + target)
    }
  }
}

function validateAuthoredSymbols(records, problems) {
  const exported = new Set(records.map((entry) => entry.name))
  const keywords = new Set(["Ink", "Esc", "Backspace", "Enter", "Back", "Quit", "Help", "Tab", "Shift", "ASCII"])

  for (const relative of authoredFiles) {
    const path = skillPath + relative
    const content = read(path)

    for (const match of content.matchAll(/\x60([A-Z][A-Za-z0-9]*|use[A-Z][A-Za-z0-9]*)\x60/g)) {
      if (!exported.has(match[1]) && !keywords.has(match[1])) {
        problems.push(path + ": " + match[1] + " is not publicly exported")
      }
    }
  }
}

function checkGenerated(problems) {
  if (!existsSync(join(root, generatedPath))) {
    problems.push("Missing " + generatedPath + "; run npm run update:skill")
  } else if (read(generatedPath) !== renderReference()) {
    problems.push(generatedPath + " is stale; run npm run update:skill")
  }
}

const mode = process.argv[2] ?? "--check"

if (!["--write", "--check", "--check-generated"].includes(mode)) {
  throw new Error("Usage: node scripts/sync-skill.mjs [--write|--check|--check-generated]")
}

if (mode === "--write") {
  const current = existsSync(join(root, generatedPath)) ? read(generatedPath) : ""
  const updated = renderReference()

  if (current !== updated) {
    writeFileSync(join(root, generatedPath), updated)
    console.log("Updated " + generatedPath)
  } else {
    console.log("Generated skill reference is already current")
  }
} else {
  const problems = []
  checkGenerated(problems)

  if (mode === "--check") {
    for (const relative of authoredFiles) {
      validateLinks(skillPath + relative, problems)
    }

    if (existsSync(join(root, generatedPath))) validateLinks(generatedPath, problems)

    validateAuthoredSymbols(publicExports(), problems)
  }

  if (problems.length) {
    for (const problem of problems) console.error(problem)
    process.exitCode = 1
  } else {
    console.log("Ink UI skill references are current and valid")
  }
}
