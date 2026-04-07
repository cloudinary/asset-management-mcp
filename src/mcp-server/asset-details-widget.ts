/*
 * Standalone MCP App widget for displaying a single Cloudinary asset
 * in a rich detail view. Attached to the get-asset-details tool.
 *
 * Shares CLDS tokens, MCPApp client, helpers, and detail renderers
 * with the gallery widget via widget-shared.ts.
 */

import {
  SHARED_CSS_TOKENS,
  SHARED_CSS_COMPONENTS,
  SHARED_JS_MCP_CLIENT,
  SHARED_JS_HELPERS,
  SHARED_JS_MODAL,
  SHARED_JS_DETAIL_RENDERERS,
  SHARED_JS_HOST_CONTEXT,
} from "./widget-shared.js";

export const ASSET_DETAILS_RESOURCE_URI = "ui://cloudinary/asset-details.html";

export function getAssetDetailsHtml(): string {
  return ASSET_DETAILS_HTML;
}

const ASSET_DETAILS_CSS = /* css */ `
body { min-height: 400px; }

.details-header {
  display: flex; align-items: center; gap: 14px;
  padding-bottom: var(--cld-sp-md);
  margin-bottom: var(--cld-sp-md);
  border-bottom: 1px solid var(--cld-border);
}

.details-header-thumb {
  width: 56px; height: 56px; border-radius: var(--cld-radius);
  object-fit: cover; background: var(--cld-bg3); flex-shrink: 0;
}

.details-header-icon {
  width: 56px; height: 56px; border-radius: var(--cld-radius);
  background: var(--cld-bg3); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.details-header-icon svg { width: 28px; height: 28px; }

.details-header-info { flex: 1; min-width: 0; }

.details-header-name {
  font-size: 16px; font-weight: 600; color: var(--cld-text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.details-header-sub {
  font-size: 12px; color: var(--cld-text3); margin-top: 2px;
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
}

.details-header-sub .pill {
  font-size: 10px; color: var(--cld-text2); background: var(--cld-bg3);
  padding: 2px 7px; border-radius: 4px; border: 1px solid var(--cld-border);
}

.open-link {
  padding: 6px 14px; border-radius: var(--cld-radius-sm);
  font-size: 12px; font-weight: 500; cursor: pointer;
  border: 1px solid var(--cld-accent); background: transparent;
  color: var(--cld-accent); font-family: inherit;
  transition: background 0.15s;
  white-space: nowrap; flex-shrink: 0;
}
.open-link:hover { background: var(--cld-accent-bg); }

.hero-container {
  position: relative; margin-bottom: var(--cld-sp-md);
  border-radius: var(--cld-radius); overflow: hidden;
  background: var(--cld-bg3);
}

.hero-container img {
  width: 100%; max-height: 300px; object-fit: contain; display: block;
}
.hero-container video {
  width: 100%; max-height: 300px; display: block;
}
.hero-container .hero-audio-wrap {
  border-radius: 0;
}

.hero-container .file-icon {
  padding: 40px 20px;
}
.hero-container .file-icon svg { width: 48px; height: 48px; }

.details-content .detail-section { padding: 14px 0; }
.details-content .detail-section:first-child { padding-top: 0; }
`;

const ASSET_DETAILS_JS = /* js */ `
var LOG_PREFIX = "[details]";
var MIN_HEIGHT = 400;
var pendingCall = { name: null, args: null };

var app = new MCPApp({ name: "Cloudinary Asset Details", version: "1.0.0" });
setupHostContext(app);

function renderPage(r) {
  var root = document.getElementById("app");
  var url = r.secure_url || r.url || "";
  var name = r.display_name || r.public_id || r.filename || "Asset";
  var fmt = (r.format || "").toUpperCase();
  var rt = r.resource_type || "";
  var dims = (r.width && r.height) ? r.width + "\\u00d7" + r.height : "";
  var size = r.bytes ? fmtBytes(r.bytes) : "";
  var dur = r.duration ? fmtDuration(r.duration) : "";

  var h = "";

  // Header
  h += '<div class="details-header">';
  var headerThumb = thumbUrl(url, 56, 56, r);
  if (headerThumb) {
    h += '<img class="details-header-thumb" src="' + esc(headerThumb) + '">';
  } else if (rt === "raw") {
    h += '<div class="details-header-icon">' + fileTypeIcon(r.format) + "</div>";
  }
  h += '<div class="details-header-info">';
  h += '<div class="details-header-name" title="' + esc(name) + '">' + esc(name) + "</div>";
  h += '<div class="details-header-sub">';
  if (fmt) h += '<span class="pill">' + esc(fmt) + "</span>";
  if (rt) h += '<span class="pill">' + esc(rt) + (r.is_audio ? " (audio)" : "") + "</span>";
  if (dims) h += '<span class="pill">' + dims + "</span>";
  if (dur) h += '<span class="pill">' + dur + "</span>";
  if (size) h += '<span class="pill">' + size + "</span>";
  h += "</div></div>";
  if (url) h += '<button class="open-link" id="open-asset">Open</button>';
  h += "</div>";

  // Hero
  h += '<div class="hero-container">';
  h += renderHeroPreview(r);
  h += "</div>";

  // Details content
  h += '<div class="details-content">';

  h += '<div class="detail-section"><div class="detail-section-title">Asset Info</div>';
  h += renderAssetGrid(r);
  h += "</div>";

  h += renderTags(r.tags);
  h += renderLastUpdated(r.last_updated);
  h += renderMetadata(r.metadata);
  h += renderDerived(r.derived);

  h += "</div>";

  root.innerHTML = h;

  // Event delegation
  root.addEventListener("click", function handler(e) {
    var el = e.target;
    while (el && el !== root) {
      if (el.id === "open-asset") {
        app._rpc("ui/open-link", { url: url });
        return;
      }
      if (el.classList && el.classList.contains("link-val") && el.dataset.url) {
        app._rpc("ui/open-link", { url: el.dataset.url });
        return;
      }
      if (el.classList && el.classList.contains("derived-open") && el.dataset.url) {
        app._rpc("ui/open-link", { url: el.dataset.url });
        return;
      }
      el = el.parentElement;
    }
  });
}

function showFetchPrompt() {
  var name = pendingCall.name || "get-asset-details";
  var root = document.getElementById("app");
  var h = '<div class="prompt">';
  h += '<div class="prompt-icon">\\u{1F4E6}</div>';
  h += '<div class="prompt-title">Could Not Display Results</div>';
  h += '<div class="prompt-desc">';
  h += "The response from <strong>" + esc(name) + "</strong> could not be rendered. ";
  h += "You can try fetching the data directly from the server.";
  h += "</div>";
  h += '<div class="prompt-actions">';
  h += '<button class="prompt-btn prompt-btn-primary" id="fetch-direct-btn">Fetch Directly</button>';
  h += "</div></div>";
  root.innerHTML = h;
  document.getElementById("fetch-direct-btn").addEventListener("click", function() { fetchDirect(); });
}

async function fetchDirect() {
  var name = pendingCall.name || "get-asset-details";
  var args = pendingCall.args || {};
  console.log(LOG_PREFIX, "tools/call ->", name);

  document.getElementById("app").innerHTML = '<div class="status">Fetching asset details\\u2026</div>';
  try {
    var res = await app.callServerTool({ name: name, arguments: args });
    var data = ingestResult(res);
    if (data && !data._truncated) {
      renderPage(data);
    } else {
      showError("No Data", "Server returned no asset details.");
    }
  } catch (e) {
    showError("Fetch Failed", e && e.message ? e.message : String(e));
  }
}

app.ontoolinput = function(params) {
  if (params.toolName) pendingCall.name = params.toolName;
  if (params.arguments) pendingCall.args = params.arguments;
};

app.ontoolresult = function(result) {
  if (result.toolName) pendingCall.name = result.toolName;

  var data = ingestResult(result);
  if (data && !data._truncated) {
    console.log(LOG_PREFIX, "host result received for", data.asset_id || data.public_id);
    renderPage(data);
    return;
  }

  console.warn(LOG_PREFIX, "host result unusable");
  showFetchPrompt();
};

app.connect().then(function() {
  console.log(LOG_PREFIX, "ready");
  setupResize(app, MIN_HEIGHT);
}).catch(function(err) {
  showError("Connection Failed", err && err.message ? err.message : String(err));
});
`;

const ASSET_DETAILS_HTML = /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cloudinary Asset Details</title>
<style>
${SHARED_CSS_TOKENS}
${SHARED_CSS_COMPONENTS}
${ASSET_DETAILS_CSS}
</style>
</head>
<body>
<div id="app"><div class="status">Loading asset details&hellip;</div></div>

<script>
${SHARED_JS_MCP_CLIENT}
${SHARED_JS_HELPERS}
${SHARED_JS_MODAL}
${SHARED_JS_DETAIL_RENDERERS}
${SHARED_JS_HOST_CONTEXT}
${ASSET_DETAILS_JS}
</script>
</body>
</html>`;
