#!/usr/bin/env node
// Prints release notes by comparing tools/list of the last published version with the local build.
//
// Usage: node scripts/tools-changelog.mjs [--prev <version>]
//        node scripts/tools-changelog.mjs --merge <notes-file> < body   (prints body with the notes block replaced)
//        node scripts/tools-changelog.mjs --extract < body             (prints only the notes block)
//        node scripts/tools-changelog.mjs --strip < body               (prints body without the notes block)
//        node scripts/tools-changelog.mjs --links                      (prints package and registry links)
// Run from the repo root after `npm run build`.

import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const START = "<!-- tools-changelog:start -->";
export const END = "<!-- tools-changelog:end -->";

const TIMEOUT_MS = 120_000;

// Starts an MCP server over stdio and returns its tools/list result.
export function listTools(command, args, { cwd } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: ["pipe", "pipe", "pipe"] });
    let buffer = "";
    let stderr = "";
    const timer = setTimeout(() => finish(new Error(`timed out waiting for tools/list from ${command} ${args.join(" ")}`)), TIMEOUT_MS);

    function finish(err, value) {
      clearTimeout(timer);
      child.kill();
      if (err) reject(new Error(`${err.message}\n${stderr}`));
      else resolve(value);
    }

    function send(message) {
      child.stdin.write(JSON.stringify(message) + "\n");
    }

    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", (err) => finish(err));
    child.on("exit", (code) => finish(new Error(`server exited with code ${code} before tools/list`)));
    child.stdout.on("data", (chunk) => {
      buffer += chunk;
      let newline;
      while ((newline = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (!line.startsWith("{")) continue;
        const message = JSON.parse(line);
        if (message.id === 1) {
          send({ jsonrpc: "2.0", method: "notifications/initialized" });
          send({ jsonrpc: "2.0", id: 2, method: "tools/list" });
        } else if (message.id === 2) {
          if (message.error) finish(new Error(`tools/list failed: ${JSON.stringify(message.error)}`));
          else finish(null, message.result.tools);
        }
      }
    });

    send({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "tools-changelog", version: "0" } },
    });
  });
}

// Flattens a JSON schema into a map of dot paths to { enum, description, required }.
export function flattenSchema(schema, path = "", required = false, out = new Map()) {
  if (!schema || typeof schema !== "object") return out;
  if (path) {
    const entry = out.get(path) ?? { enum: new Set(), description: undefined, required: false };
    for (const value of schema.enum ?? []) entry.enum.add(JSON.stringify(value));
    if (schema.const !== undefined) entry.enum.add(JSON.stringify(schema.const));
    entry.description ??= schema.description;
    entry.required ||= required;
    out.set(path, entry);
  }
  const requiredKeys = new Set(schema.required ?? []);
  for (const [key, child] of Object.entries(schema.properties ?? {})) {
    flattenSchema(child, path ? `${path}.${key}` : key, requiredKeys.has(key), out);
  }
  if (schema.items) flattenSchema(schema.items, `${path}[]`, false, out);
  for (const branch of [...(schema.anyOf ?? []), ...(schema.oneOf ?? []), ...(schema.allOf ?? [])]) {
    flattenSchema(branch, path, false, out);
  }
  if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
    flattenSchema(schema.additionalProperties, `${path}.*`, false, out);
  }
  return out;
}

// Returns the list of parameter-level changes between two input schemas.
export function diffParams(oldSchema, newSchema) {
  const [oldRoot, newRoot] = unwrap(oldSchema, newSchema);
  const before = flattenSchema(oldRoot);
  const after = flattenSchema(newRoot);
  const changes = [];
  for (const [path, entry] of after) {
    const prev = before.get(path);
    if (!prev) {
      const parent = parentPath(path);
      if (parent === "" || before.has(parent)) {
        changes.push(`\`${path}\` **Added**${entry.required ? " (required)" : ""}`);
      }
      continue;
    }
    if (prev.required !== entry.required) {
      changes.push(`\`${path}\` is now ${entry.required ? "**required**" : "**optional**"}`);
    }
    for (const value of entry.enum) {
      if (!prev.enum.has(value)) changes.push(`\`${path}\`: value \`${JSON.parse(value)}\` **Added**`);
    }
    for (const value of prev.enum) {
      if (!entry.enum.has(value)) changes.push(`\`${path}\`: value \`${JSON.parse(value)}\` **Removed**`);
    }
    if ((prev.description ?? "") !== (entry.description ?? "")) {
      changes.push(`\`${path}\`: description updated`);
    }
  }
  for (const path of before.keys()) {
    const parent = parentPath(path);
    if (!after.has(path) && (parent === "" || after.has(parent))) changes.push(`\`${path}\` **Removed**`);
  }
  return changes;
}

// Drops a shared single top-level wrapper such as `request` so paths read as parameter names.
function unwrap(oldSchema, newSchema) {
  const oldKeys = Object.keys(oldSchema?.properties ?? {});
  const newKeys = Object.keys(newSchema?.properties ?? {});
  if (oldKeys.length === 1 && newKeys.length === 1 && oldKeys[0] === newKeys[0]) {
    return [oldSchema.properties[oldKeys[0]], newSchema.properties[newKeys[0]]];
  }
  return [oldSchema, newSchema];
}

function parentPath(path) {
  const cut = Math.max(path.lastIndexOf("."), path.endsWith("[]") ? path.length - 2 : -1);
  return cut > 0 ? path.slice(0, cut) : "";
}

function firstLine(text) {
  return (text ?? "").split("\n").find((line) => line.trim())?.trim() ?? "";
}

// Returns added, removed and changed tools between two tools/list results.
export function diffTools(oldTools, newTools) {
  const before = new Map(oldTools.map((tool) => [tool.name, tool]));
  const after = new Map(newTools.map((tool) => [tool.name, tool]));
  const added = [...after.values()].filter((tool) => !before.has(tool.name));
  const removed = [...before.values()].filter((tool) => !after.has(tool.name));
  const changed = [];
  for (const tool of after.values()) {
    const prev = before.get(tool.name);
    if (!prev) continue;
    const changes = diffParams(prev.inputSchema, tool.inputSchema);
    if ((prev.description ?? "") !== (tool.description ?? "")) changes.unshift("Description updated");
    if (changes.length) changed.push({ name: tool.name, changes });
  }
  const byName = (a, b) => a.name.localeCompare(b.name);
  return { added: added.sort(byName), removed: removed.sort(byName), changed: changed.sort(byName) };
}

// Returns changes to dependencies and overrides between two package.json objects.
export function diffDeps(oldPkg, newPkg) {
  const changes = [];
  for (const field of ["dependencies", "overrides"]) {
    const before = oldPkg?.[field] ?? {};
    const after = newPkg?.[field] ?? {};
    for (const name of [...new Set([...Object.keys(before), ...Object.keys(after)])].sort()) {
      if (before[name] === after[name]) continue;
      if (before[name] === undefined) changes.push(`\`${name}\` \`${after[name]}\` **Added**`);
      else if (after[name] === undefined) changes.push(`\`${name}\` **Removed**`);
      else changes.push(`\`${name}\` \`${before[name]}\` → \`${after[name]}\``);
    }
  }
  return changes;
}

// Renders the release notes markdown.
export function render({ version, tools, deps, schema }) {
  const lines = [START, `## What's new in ${version}`, ""];
  const section = (title, items) => {
    if (!items.length) return;
    lines.push(`### ${title}`, ...items, "");
  };
  section("New tools", tools.added.map((tool) => `* \`${tool.name}\`: ${firstLine(tool.description)}`));
  section("Removed tools", tools.removed.map((tool) => `* \`${tool.name}\``));
  section("Changed tools", tools.changed.flatMap(({ name, changes }) => [`* \`${name}\``, ...changes.map((c) => `  * ${c}`)]));
  section("Dependencies", deps.map((d) => `* ${d}`));
  if (lines.length === 3) {
    if (schema.old && schema.new && schema.old !== schema.new) lines.push(`* Updated to API schema ${schema.old} → ${schema.new}.`, "");
    else lines.push("* No changes to tools or dependencies.", "");
  }
  lines.push(END);
  return lines.join("\n");
}

// Replaces the notes block in a PR body, or appends it when there is none.
export function mergeBody(body, notes) {
  const start = body.indexOf(START);
  const end = body.indexOf(END, start);
  if (start >= 0 && end >= 0) return body.slice(0, start) + notes + body.slice(end + END.length);
  return body.trim() ? `${body.trimEnd()}\n\n${notes}` : notes;
}

// Removes the notes block from a PR body.
export function stripNotes(body) {
  const start = body.indexOf(START);
  const end = body.indexOf(END, start);
  if (start < 0 || end < 0) return body;
  return `${body.slice(0, start).trimEnd()}\n\n${body.slice(end + END.length).trimStart()}`.trim();
}

// Returns the notes block from a PR body without its markers, or an empty string.
export function extractNotes(body) {
  const start = body.indexOf(START);
  const end = body.indexOf(END, start);
  if (start < 0 || end < 0) return "";
  return body.slice(start + START.length, end).trim();
}

// Renders links to the published packages and the MCP Registry entry.
export function renderLinks(pkg, server) {
  const version = pkg.version;
  const lines = ["### Packages", `* npm: [${pkg.name}@${version}](https://www.npmjs.com/package/${pkg.name}/v/${version})`];
  const oci = server.packages?.find((p) => p.registryType === "oci")?.identifier;
  if (oci) {
    const image = oci.replace(/^docker\.io\//, "").replace(/:[^/:]+$/, "");
    lines.push(`* Docker Hub: [${image}:${version}](https://hub.docker.com/r/${image}/tags?name=${version})`);
  }
  lines.push(
    "",
    "### MCP Registry",
    `[${server.name} ${server.version}](https://registry.modelcontextprotocol.io/v0/servers/${encodeURIComponent(server.name)}/versions/${server.version})`,
  );
  return lines.join("\n");
}

function docVersion(lockText) {
  return lockText?.match(/^\s*docVersion:\s*(\S+)/m)?.[1];
}

function gitShow(ref) {
  try {
    return execFileSync("git", ["show", ref], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return undefined;
  }
}

async function main() {
  const flag = (name) => {
    const index = process.argv.indexOf(name);
    return index > 0 ? process.argv[index + 1] : undefined;
  };
  if (process.argv.includes("--merge")) {
    process.stdout.write(mergeBody(readFileSync(0, "utf8"), readFileSync(flag("--merge"), "utf8").trim()) + "\n");
    return;
  }
  if (process.argv.includes("--links")) {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    const server = JSON.parse(readFileSync("server.json", "utf8"));
    process.stdout.write(renderLinks(pkg, server) + "\n");
    return;
  }
  if (process.argv.includes("--strip")) {
    process.stdout.write(stripNotes(readFileSync(0, "utf8")) + "\n");
    return;
  }
  if (process.argv.includes("--extract")) {
    process.stdout.write(extractNotes(readFileSync(0, "utf8")) + "\n");
    return;
  }

  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const prev = flag("--prev")
    ?? execFileSync("npm", ["view", pkg.name, "version"], { encoding: "utf8" }).trim();

  const [oldTools, newTools] = await Promise.all([
    listTools("npx", ["-y", `${pkg.name}@${prev}`, "start"], { cwd: mkdtempSync(join(tmpdir(), "tools-changelog-")) }),
    listTools("node", ["bin/mcp-server.js", "start"]),
  ]);
  const oldPkg = JSON.parse(execFileSync("npm", ["view", `${pkg.name}@${prev}`, "--json"], { encoding: "utf8" }));

  process.stdout.write(render({
    version: pkg.version,
    tools: diffTools(oldTools, newTools),
    deps: diffDeps(oldPkg, pkg),
    schema: {
      old: docVersion(gitShow(`v${prev}:.speakeasy/gen.lock`)),
      new: docVersion(readFileSync(".speakeasy/gen.lock", "utf8")),
    },
  }) + "\n");
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
