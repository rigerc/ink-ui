import { readFileSync, readdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("../", import.meta.url))
const file = (relativePath) => join(root, relativePath)
const beginMarker = "<!-- BEGIN GENERATED REPOSITORY CONTEXT -->"
const endMarker = "<!-- END GENERATED REPOSITORY CONTEXT -->"

function countFiles(directory, pattern) {
  return readdirSync(file(directory), { withFileTypes: true })
    .filter((entry) => entry.isFile() && pattern.test(entry.name)).length
}

function inline(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("`", "\\`").replaceAll("\n", " ")
}

function generateContext() {
  const pkg = JSON.parse(readFileSync(file("package.json"), "utf8"))
  const modules = countFiles("src/components", /^(?!.*\.test\.)[^.].*\.[cm]?tsx?$/)
  const tests = countFiles("src/components", /\.test\.[cm]?tsx?$/)
  const docs = countFiles("docs", /\.mdx?$/)
  const scripts = Object.entries(pkg.scripts ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, command]) => `| \`npm run ${inline(name)}\` | \`${inline(command)}\` |`)

  const peers = Object.entries(pkg.peerDependencies ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, range]) => `\`${inline(name)}\` ${inline(range)}`)
    .join(", ") || "none"

  return [
    beginMarker,
    "",
    "## Live repository reference (generated)",
    "",
    "This section is updated from the codebase by `npm run update:agents`.",
    "Do not edit it by hand; the guidance above remains human-maintained.",
    "",
    `- **Package:** \`${inline(pkg.name)}\` v${inline(pkg.version)}`,
    `- **Runtime:** Node \`${inline(pkg.engines?.node ?? "unspecified")}\`, ${pkg.type === "module" ? "ES modules" : "CommonJS/default modules"}`,
    `- **Peer dependencies:** ${peers}`,
    "- **Public API:** `src/index.ts`; build output/types: `dist/index.js` and `dist/index.d.ts`",
    `- **Source layout:** \`src/components/\` has ${modules} implementation modules and ${tests} adjacent test files; \`docs/\` has ${docs} documentation pages`,
    "",
    "### Available npm scripts",
    "",
    "| Command | package.json definition |",
    "| --- | --- |",
    ...scripts,
    "",
    endMarker,
  ].join("\n")
}

function replaceContext(document, generated) {
  const begin = document.indexOf(beginMarker)
  const end = document.indexOf(endMarker)
  if ((begin < 0) !== (end < 0) ||
      (begin >= 0 && (begin >= end || document.indexOf(beginMarker, begin + 1) !== -1 || document.indexOf(endMarker, end + 1) !== -1))) {
    throw new Error("AGENTS.md has malformed or duplicate generated-context markers")
  }
  if (begin < 0) return `${document.trimEnd()}\n\n${generated}\n`
  return document.slice(0, begin) + generated + document.slice(end + endMarker.length)
}

const path = file("AGENTS.md")
const current = readFileSync(path, "utf8")
const updated = replaceContext(current, generateContext())
if (process.argv.includes("--check")) {
  if (updated !== current) {
    console.error("AGENTS.md generated context is stale; run npm run update:agents")
    process.exitCode = 1
  } else {
    console.log("AGENTS.md generated context is current")
  }
} else if (updated !== current) {
  writeFileSync(path, updated)
  console.log("Updated AGENTS.md generated context")
} else {
  console.log("AGENTS.md generated context is already current")
}
