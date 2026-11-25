// Unit tests for tools-changelog.mjs. Run with: node --test scripts/tools-changelog.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { diffTools, diffDeps, render, mergeBody, extractNotes, stripNotes, renderLinks, START, END } from "./tools-changelog.mjs";

const tool = (name, properties, required = [], description = `${name} tool\n\nMore detail.`) => ({
  name,
  description,
  inputSchema: {
    type: "object",
    properties: { request: { type: "object", properties, required } },
    required: ["request"],
  },
});

const oldTools = [
  tool("create-trigger", {
    uri: { type: "string", description: "Destination URL." },
    uri_type: { type: "string", enum: ["webhook", "flow"] },
    event_type: { type: "string" },
  }, ["uri"]),
  tool("list-things", { cursor: { type: "string" } }),
  tool("old-tool", {}),
];

const newTools = [
  tool("create-trigger", {
    uri: { type: "string", description: "Destination URL or poll address." },
    uri_type: { type: "string", enum: ["webhook", "poll"] },
    event_type: { type: "string" },
    options: { type: "object", properties: { retries: { type: "integer" } } },
  }, ["uri", "event_type"]),
  tool("list-things", { cursor: { type: "string" } }),
  tool("new-tool", {}),
];

test("tools added, removed and unchanged", () => {
  const diff = diffTools(oldTools, newTools);
  assert.deepEqual(diff.added.map((t) => t.name), ["new-tool"]);
  assert.deepEqual(diff.removed.map((t) => t.name), ["old-tool"]);
  assert.deepEqual(diff.changed.map((t) => t.name), ["create-trigger"]);
});

test("parameter changes", () => {
  const [{ changes }] = diffTools(oldTools, newTools).changed;
  assert.deepEqual(changes.sort(), [
    "`event_type` is now **required**",
    "`options` **Added**",
    "`uri_type`: value `flow` **Removed**",
    "`uri_type`: value `poll` **Added**",
    "`uri`: description updated",
  ]);
});

test("parameter removed and tool description changed", () => {
  const before = [tool("t", { a: { type: "string" }, b: { type: "string" } })];
  const after = [tool("t", { a: { type: "string" } }, [], "t tool\n\nNew detail.")];
  const [{ changes }] = diffTools(before, after).changed;
  assert.deepEqual(changes, ["Description updated", "`b` **Removed**"]);
});

test("dependency changes", () => {
  const changes = diffDeps(
    { dependencies: { zod: "^4.0.0", express: "^5.0.0" }, overrides: { hono: ">=4.13.11" } },
    { dependencies: { zod: "^4.6.6", ws: "^8.0.0" }, overrides: { hono: ">=4.13.11" } },
  );
  assert.deepEqual(changes, [
    "`express` **Removed**",
    "`ws` `^8.0.0` **Added**",
    "`zod` `^4.0.0` → `^4.6.6`",
  ]);
});

test("render lists sections and wraps them in markers", () => {
  const notes = render({ version: "1.2.0", tools: diffTools(oldTools, newTools), deps: [], schema: {} });
  assert.ok(notes.startsWith(`${START}\n## What's new in 1.2.0`));
  assert.ok(notes.endsWith(END));
  assert.match(notes, /### New tools\n\* `new-tool`: new-tool tool\n/);
  assert.match(notes, /### Removed tools\n\* `old-tool`\n/);
  assert.match(notes, /### Changed tools\n\* `create-trigger`\n {2}\* /);
  assert.doesNotMatch(notes, /API schema/);
});

test("schema bump only", () => {
  const notes = render({
    version: "0.7.1",
    tools: diffTools(oldTools, oldTools),
    deps: [],
    schema: { old: "0.7.4", new: "0.7.5" },
  });
  assert.equal(notes, `${START}\n## What's new in 0.7.1\n\n* Updated to API schema 0.7.4 → 0.7.5.\n\n${END}`);
});

test("merge replaces the notes block and keeps the rest", () => {
  const body = `Intro\n\n${START}\nold\n${END}\n\nTest plan`;
  assert.equal(mergeBody(body, `${START}\nnew\n${END}`), `Intro\n\n${START}\nnew\n${END}\n\nTest plan`);
});

test("merge appends the notes block when there is none", () => {
  assert.equal(mergeBody("Intro\n", `${START}\nnew\n${END}`), `Intro\n\n${START}\nnew\n${END}`);
  assert.equal(mergeBody("", "notes"), "notes");
});

test("extract returns the notes without markers", () => {
  assert.equal(extractNotes(`x\n${START}\n## What's new\n${END}\ny`), "## What's new");
  assert.equal(extractNotes("no markers"), "");
});

test("nothing changed", () => {
  const notes = render({ version: "0.6.4", tools: diffTools(oldTools, oldTools), deps: [], schema: { old: "0.5.5", new: "0.5.5" } });
  assert.equal(notes, `${START}\n## What's new in 0.6.4\n\n* No changes to tools or dependencies.\n\n${END}`);
});

test("links to packages and the registry", () => {
  const links = renderLinks(
    { name: "@cloudinary/example-mcp", version: "0.7.0" },
    {
      name: "com.cloudinary/example-mcp",
      version: "0.7.0",
      packages: [
        { registryType: "npm", identifier: "@cloudinary/example-mcp", version: "0.7.0" },
        { registryType: "oci", identifier: "docker.io/cloudinary/example-mcp:0.7.0" },
      ],
    },
  );
  assert.equal(links, [
    "### Packages",
    "* npm: [@cloudinary/example-mcp@0.7.0](https://www.npmjs.com/package/@cloudinary/example-mcp/v/0.7.0)",
    "* Docker Hub: [cloudinary/example-mcp:0.7.0](https://hub.docker.com/r/cloudinary/example-mcp/tags?name=0.7.0)",
    "",
    "### MCP Registry",
    "[com.cloudinary/example-mcp 0.7.0](https://registry.modelcontextprotocol.io/v0/servers/com.cloudinary%2Fexample-mcp/versions/0.7.0)",
  ].join("\n"));
});

test("strip removes the notes block", () => {
  assert.equal(stripNotes(`Intro\n\n${START}\nnotes\n${END}\n\nTest plan`), "Intro\n\nTest plan");
  assert.equal(stripNotes(`Intro\n\n${START}\nnotes\n${END}\n`), "Intro");
  assert.equal(stripNotes("Intro"), "Intro");
});
