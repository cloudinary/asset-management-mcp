/*
 * Markdown response formatting for MCP tools.
 *
 * Converts raw Cloudinary API JSON responses into clean markdown
 * when `responseContentFormat: "markdown"` is requested.
 * Includes inline thumbnails via Cloudinary transformation URLs.
 */

import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export type ResponseContentFormat = "json" | "markdown";

interface ResourceEntry {
  public_id?: string;
  asset_id?: string;
  asset_folder?: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  secure_url?: string;
  url?: string;
  created_at?: string;
  uploaded_at?: string;
  tags?: string[];
  filename?: string;
  resource_type?: string;
  version?: number;
  context?: Record<string, string>;
  [key: string]: unknown;
}

interface ListResponse {
  resources?: ResourceEntry[];
  next_cursor?: string;
  rate_limit_allowed?: number;
  rate_limit_remaining?: number;
  rate_limit_reset_at?: string;
  _headers?: Record<string, string>;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[i]}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function escPipe(s: string): string {
  return s.replace(/\|/g, "\\|");
}

/**
 * Injects a Cloudinary transformation into an existing delivery URL
 * to produce a small thumbnail. Works by inserting the transformation
 * component right after `/upload/` (or `/fetch/` etc.) in the URL path.
 */
function thumbnailUrl(originalUrl: string, size = 60): string {
  return originalUrl.replace(
    /\/(upload|fetch|private|authenticated)\//,
    `/$1/c_thumb,g_auto,w_${size},h_${size},f_auto/`,
  );
}

export function listResourcesToMarkdown(
  json: ListResponse,
  resourceLabel: string = "image",
): string {
  const resources = json.resources ?? [];
  const lines: string[] = [];
  const pluralLabel = resources.length === 1 ? resourceLabel : `${resourceLabel}s`;

  if (resources.length === 0) {
    lines.push(`No ${resourceLabel}s found.`);
    return lines.join("\n");
  }

  const summary = [`**${resources.length} ${pluralLabel}**`];
  if (json.next_cursor) summary.push("more results available");
  lines.push(summary.join(" · "));
  lines.push("");

  lines.push("| | Public ID | Format | Size | Tags | Created |");
  lines.push("|:---:|:---|:---:|---:|:---|:---:|");

  for (const r of resources) {
    const url = r.secure_url ?? r.url;
    const name = r.public_id ?? "unknown";

    const thumb = url ? `![](${thumbnailUrl(url)})` : "";
    const id = url ? `[${escPipe(name)}](${url})` : escPipe(name);
    const fmt = r.format ? r.format.toUpperCase() : "—";
    const dims = r.width != null && r.height != null ? `${r.width}x${r.height}` : "";
    const size = r.bytes != null && r.bytes > 0
      ? (dims ? `${formatBytes(r.bytes)} (${dims})` : formatBytes(r.bytes))
      : (dims || "—");
    const tags = r.tags && r.tags.length > 0
      ? r.tags.map((t) => `\`${escPipe(t)}\``).join(", ")
      : "—";
    const date = r.created_at ? formatDate(r.created_at) : "—";

    lines.push(`| ${thumb} | ${id} | ${fmt} | ${size} | ${tags} | ${date} |`);
  }

  if (json.next_cursor) {
    lines.push("");
    lines.push(`*More results available — pass \`next_cursor\` to continue.*`);
  }

  return lines.join("\n");
}

/**
 * Builds the CallToolResult with MCP content blocks.
 * Returns both an image content block per thumbnail (for inline display)
 * and a text block with the full markdown table.
 * The text block is annotated with `audience: ["user"]` so clients
 * can surface it without requiring expansion.
 */
export async function formatResultWithContentFormat(
  response: Response,
  responseContentFormat: ResponseContentFormat | undefined,
  resourceLabel: string = "image",
): Promise<CallToolResult> {
  if (responseContentFormat !== "markdown") {
    const text = await response.text();
    const content: CallToolResult["content"] = [{ type: "text", text }];
    return response.ok ? { content } : { content, isError: true };
  }

  const json: ListResponse = await response.json();
  const markdown = listResourcesToMarkdown(json, resourceLabel);
  return {
    content: [{
      type: "text",
      text: markdown,
      annotations: { audience: ["user" as const] },
    }],
  };
}
