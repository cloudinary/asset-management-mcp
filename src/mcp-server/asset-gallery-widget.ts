/*
 * MCP App widget for displaying Cloudinary assets in an interactive
 * gallery. Attached to list-images, list-videos, list-files, and
 * search-assets tools.
 *
 * Shares CLDS tokens, MCPApp client, helpers, and detail renderers
 * with the details widget via widget-shared.ts.
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

export const ASSET_GALLERY_RESOURCE_URI = "ui://cloudinary/asset-gallery.html";
export const MCP_APP_MIME_TYPE = "text/html;profile=mcp-app";

export function getAssetGalleryHtml(): string {
  return ASSET_GALLERY_HTML;
}

const GALLERY_CSS = /* css */ `
body { min-height: 580px; }

.header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: var(--cld-sp-md); padding-bottom: var(--cld-sp-sm);
  border-bottom: 1px solid var(--cld-border);
}
.header h1 {
  font-size: var(--cld-font-sm); font-weight: 600;
  display: flex; align-items: center; gap: var(--cld-sp-xs); color: var(--cld-text);
}
.count-badge {
  font-size: var(--cld-font-xxs); color: var(--cld-text2); background: var(--cld-bg3);
  padding: var(--cld-sp-xxs) var(--cld-sp-sm); border-radius: var(--cld-radius-lg); font-weight: 500;
}

.grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--cld-sp-sm);
}
.card {
  background: var(--cld-bg2); border: 1px solid var(--cld-border);
  border-radius: var(--cld-radius); overflow: hidden;
  transition: box-shadow 0.2s ease, transform 0.15s ease; cursor: default;
}
.card:hover { box-shadow: var(--cld-shadow-sm); transform: translateY(-1px); }

.thumb {
  position: relative; width: 100%; aspect-ratio: 4/3; background: var(--cld-bg3);
  overflow: hidden; display: flex; align-items: center; justify-content: center;
}
.thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
.card:hover .thumb img { transform: scale(1.03); }
.thumb .badge {
  position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.65);
  color: #fff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;
  text-transform: uppercase; letter-spacing: 0.5px; backdrop-filter: blur(4px);
}
.thumb .placeholder { color: var(--cld-text3); font-size: 28px; }
.thumb.link:hover { opacity: 0.9; }

.info { padding: var(--cld-sp-xs) var(--cld-sp-sm) var(--cld-sp-sm); }
.info .name {
  font-size: 13px; font-weight: 600; color: var(--cld-text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 6px;
}
.info .name .link { color: inherit; text-decoration: none; }
.info .name .link:hover { color: var(--cld-accent); text-decoration: underline; }

.pills { display: flex; flex-wrap: wrap; gap: 4px; }
.pill {
  font-size: 10px; color: var(--cld-text2); background: var(--cld-bg);
  padding: 2px 7px; border-radius: 4px; border: 1px solid var(--cld-border); white-space: nowrap;
}

.tags { margin-top: 6px; display: flex; flex-wrap: wrap; gap: 4px; }
.tag {
  font-size: var(--cld-font-xxs); background: var(--cld-chip-tag-bg);
  color: var(--cld-chip-tag-fg); padding: 2px 7px; border-radius: var(--cld-radius-lg); font-weight: 500;
}

.card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
.date { font-size: 10px; color: var(--cld-text3); }
.details-link {
  font-size: 11px; color: var(--cld-accent); cursor: pointer;
  font-weight: 500; margin-left: auto;
}
.details-link:hover { text-decoration: underline; }
`;

const GALLERY_JS = /* js */ `
var LOG_PREFIX = "[gallery]";
var MIN_HEIGHT = 580;
var allResources = [];
var lastCursor = null;
var pendingCall = { name: null, args: null };
var app = new MCPApp({ name: "Cloudinary Asset Gallery", version: "1.0.0" });
setupHostContext(app);

function render() {
  var root = document.getElementById("app");

  if (allResources.length === 0) {
    root.innerHTML = '<div class="status"><div class="icon">\\u{1F4F7}</div>No assets found.</div>';
    return;
  }

  var h = "";
  h += '<div class="header">';
  h += '<h1>Cloudinary Assets</h1>';
  h += '<span class="count-badge">' + allResources.length + (lastCursor ? "+" : "") + " items</span>";
  h += "</div>";

  h += '<div class="grid">';
  for (var i = 0; i < allResources.length; i++) {
    var r = allResources[i];
    var url = r.secure_url || r.url || "";
    var thumb = thumbUrl(url, 300, 225, r);
    var name = r.public_id || r.filename || "unknown";
    var fmt = (r.format || "").toUpperCase();
    var dims = (r.width && r.height) ? r.width + "\\u00d7" + r.height : "";
    var size = r.bytes ? fmtBytes(r.bytes) : "";
    var date = fmtDate(r.created_at);
    var tags = r.tags || [];
    var rt = r.resource_type || "";
    var audio = isAudioResource(r);
    var dur = r.duration ? fmtDuration(r.duration) : "";

    h += '<div class="card">';
    h += '<div class="thumb' + (url ? " link" : "") + '"' + (url ? ' data-url="' + esc(url) + '"' : '') + '>';
    if (thumb) {
      h += '<img src="' + esc(thumb) + '" alt="' + esc(name) + '" loading="lazy">';
      if (audio) {
        h += '<div class="thumb-overlay playable" data-play="' + i + '"><div class="audio-icon">\\u266B</div></div>';
      } else if (rt === "video") {
        h += '<div class="thumb-overlay playable" data-play="' + i + '"><div class="play-icon"></div></div>';
      }
      if (dur) h += '<div class="duration-badge">' + dur + "</div>";
    } else if (rt === "raw") {
      h += '<div class="file-icon">' + fileTypeIcon(r.format) + "</div>";
    } else {
      h += '<span class="placeholder">\\u{1F5BC}</span>';
    }
    if (fmt) h += '<span class="badge">' + esc(fmt) + "</span>";
    h += "</div>";

    h += '<div class="info">';
    h += '<div class="name" title="' + esc(name) + '">';
    if (url) h += '<span class="link" data-url="' + esc(url) + '">' + esc(name) + "</span>";
    else h += esc(name);
    h += "</div>";

    var pills = [];
    if (dims) pills.push(dims);
    if (dur) pills.push(dur);
    if (size) pills.push(size);
    if (pills.length) {
      h += '<div class="pills">';
      for (var p = 0; p < pills.length; p++) h += '<span class="pill">' + pills[p] + "</span>";
      h += "</div>";
    }

    if (tags.length) {
      h += '<div class="tags">';
      for (var t = 0; t < tags.length; t++) h += '<span class="tag">' + esc(tags[t]) + "</span>";
      h += "</div>";
    }

    h += '<div class="card-footer">';
    if (date) h += '<div class="date">' + date + "</div>";
    h += '<span class="details-link" data-idx="' + i + '">Details</span>';
    h += "</div>";

    h += "</div></div>";
  }
  h += "</div>";

  root.innerHTML = h;

  root.addEventListener("click", function(e) {
    var el = e.target;
    while (el && el !== root) {
      if (el.dataset && el.dataset.play != null) {
        playMedia(parseInt(el.dataset.play, 10));
        return;
      }
      if (el.classList && el.classList.contains("details-link") && el.dataset.idx != null) {
        showDetails(parseInt(el.dataset.idx, 10));
        return;
      }
      if (el.classList && el.classList.contains("link") && el.dataset.url) {
        app._rpc("ui/open-link", { url: el.dataset.url });
        return;
      }
      el = el.parentElement;
    }
  });
}

function playMedia(idx) {
  var r = allResources[idx];
  if (!r) return;

  var url = r.secure_url || r.url || "";
  var name = r.display_name || r.public_id || r.filename || "Asset";
  var sub = (r.format || "").toUpperCase();
  if (r.duration) sub += " \\u00b7 " + fmtDuration(r.duration);
  if (r.bytes) sub += " \\u00b7 " + fmtBytes(r.bytes);

  var header = modalHeader(name, url, sub, r);
  var body = renderMediaModalBody(r);
  openModal(header, body);
}

// Details modal (calls get-asset-details for full data)
async function showDetails(idx) {
  var r = allResources[idx];
  if (!r) return;

  var url = r.secure_url || r.url || "";
  var name = r.display_name || r.public_id || r.filename || "Asset";
  var sub = (r.format || "").toUpperCase();
  if (r.width && r.height) sub += " \\u00b7 " + r.width + "\\u00d7" + r.height;
  if (r.duration) sub += " \\u00b7 " + fmtDuration(r.duration);

  var header = modalHeader(name, url, sub, r);
  var loadingBody = '<div class="modal-loading"><div class="spinner"></div><div>Loading asset details\\u2026</div></div>';
  openModal(header, loadingBody);

  try {
    var res = await app.callServerTool({
      name: "get-asset-details",
      arguments: { asset_id: r.asset_id },
    });
    var data = ingestResult(res);
    if (data && !data._truncated) {
      console.log(LOG_PREFIX, "details loaded for", r.asset_id);
      var modalBody = document.querySelector(".modal-body");
      if (modalBody) modalBody.innerHTML = renderFullDetails(data);
    } else {
      var mb = document.querySelector(".modal-body");
      if (mb) mb.innerHTML = renderModalError("Unexpected Response", "Could not parse asset details from the server response.");
    }
  } catch (e) {
    var errMsg = String(e && e.message ? e.message : e);
    var isTimeout = errMsg.indexOf("timeout") !== -1 || errMsg.indexOf("Timeout") !== -1;
    var title = isTimeout ? "Request Timed Out" : "Failed to Load Details";
    var detail = isTimeout
      ? "The server did not respond within " + (TOOL_CALL_TIMEOUT_MS / 1000) + "s. The MCP server may be overloaded or disconnected."
      : errMsg;
    console.error(LOG_PREFIX, "showDetails error:", errMsg);
    var mb2 = document.querySelector(".modal-body");
    if (mb2) mb2.innerHTML = renderModalError(title, detail);
  }
}

// Bootstrap
app.ontoolinput = function(params) {
  if (params.toolName) pendingCall.name = params.toolName;
  if (params.arguments) {
    pendingCall.args = params.arguments;
    if (!pendingCall.name)
      pendingCall.name = params.arguments.request !== undefined ? "search-assets" : "list-images";
  }
};

app.ontoolresult = function(result) {
  if (result.toolName) pendingCall.name = result.toolName;

  var data = ingestResult(result);
  if (data && data.resources) {
    console.log(LOG_PREFIX, "host result:", data.resources.length, "resources");
    allResources = data.resources;
    lastCursor = data.next_cursor || null;
    render();
    return;
  }

  console.warn(LOG_PREFIX, "host result unusable");
  showFetchPrompt();
};

function showFetchPrompt() {
  var name = pendingCall.name || "list-images";
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
  var name = pendingCall.name || "list-images";
  var args = pendingCall.args || {};
  console.log(LOG_PREFIX, "tools/call ->", name);

  document.getElementById("app").innerHTML = '<div class="status">Fetching assets\\u2026</div>';
  try {
    var res = await app.callServerTool({ name: name, arguments: args });
    var data = ingestResult(res);
    if (data && data.resources) {
      console.log(LOG_PREFIX, "direct fetch:", data.resources.length, "resources");
      allResources = data.resources;
      lastCursor = data.next_cursor || null;
      render();
    } else {
      showError("No Data", "Server returned no assets.");
    }
  } catch (e) {
    showError("Fetch Failed", e && e.message ? e.message : String(e));
  }
}

app.connect().then(function() {
  console.log(LOG_PREFIX, "ready");
  setupResize(app, MIN_HEIGHT);
}).catch(function(err) {
  showError("Connection Failed", err && err.message ? err.message : String(err));
});
`;

const ASSET_GALLERY_HTML = /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cloudinary Asset Gallery</title>
<style>
${SHARED_CSS_TOKENS}
${SHARED_CSS_COMPONENTS}
${GALLERY_CSS}
</style>
</head>
<body>
<div id="app"><div class="status">Loading assets&hellip;</div></div>

<script>
${SHARED_JS_MCP_CLIENT}
${SHARED_JS_HELPERS}
${SHARED_JS_MODAL}
${SHARED_JS_DETAIL_RENDERERS}
${SHARED_JS_HOST_CONTEXT}
${GALLERY_JS}
</script>
</body>
</html>`;
