/*
 * MCP App widget for uploading assets to Cloudinary.
 * Attached to the upload-asset tool.
 *
 * Two modes:
 *  1. AI provides a file URL → widget shows the upload result.
 *  2. No file / error → widget shows a drag-and-drop file picker
 *     and uploads via tools/call through the MCP server.
 *
 * Shares CLDS tokens, MCPApp client, helpers, and detail renderers
 * with the gallery/details widgets via widget-shared.ts.
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

export const ASSET_UPLOAD_RESOURCE_URI = "ui://cloudinary/asset-upload.html";

export function getAssetUploadHtml(): string {
  return ASSET_UPLOAD_HTML;
}

const UPLOAD_CSS = /* css */ `
body { min-height: 400px; }

.upload-header {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: var(--cld-sp-md); padding-bottom: var(--cld-sp-sm);
  border-bottom: 1px solid var(--cld-border);
}
.upload-header h1 {
  font-size: var(--cld-font-sm); font-weight: 600; color: var(--cld-text);
}
.upload-header-icon { font-size: 20px; }

.upload-result .detail-section { padding: 14px 16px; }
.upload-result .detail-section:first-child { padding-top: 0; }

.upload-another {
  margin-top: 16px; text-align: center;
}
`;

const UPLOAD_JS = /* js */ `
var LOG_PREFIX = "[upload]";
var MIN_HEIGHT = 400;
var UPLOAD_TOOL_TIMEOUT_MS = 120000;
var pendingCall = { name: null, args: null };
var capturedArgs = {};
var state = "idle";

var app = new MCPApp({ name: "Cloudinary Upload", version: "1.0.0" });
setupHostContext(app);

function extractUploadArgs(args) {
  if (!args) return {};
  var ua = args.upload_request || args;
  var out = {};
  var passthrough = [
    "display_name", "tags", "asset_folder", "folder", "public_id",
    "public_id_prefix", "use_filename", "unique_filename",
    "use_filename_as_display_name", "unique_display_name",
    "overwrite", "invalidate", "type", "access_mode", "context",
    "metadata", "backup", "eager", "eager_async", "transformation",
    "format", "allowed_formats", "moderation"
  ];
  for (var i = 0; i < passthrough.length; i++) {
    var k = passthrough[i];
    if (ua[k] !== undefined && ua[k] !== null && ua[k] !== "") out[k] = ua[k];
  }
  return out;
}

function renderPicker() {
  state = "idle";
  var root = document.getElementById("app");
  var h = "";

  h += '<div class="upload-header">';
  h += '<span class="upload-header-icon">\\u2B06\\uFE0F</span>';
  h += '<h1>Upload to Cloudinary</h1>';
  h += "</div>";

  h += '<div class="upload-zone" id="drop-zone">';
  h += '<div class="upload-zone-icon">\\u{1F4C1}</div>';
  h += '<div class="upload-zone-text">Drag & drop a file here</div>';
  h += '<div class="upload-zone-hint">Images, videos, PDFs, and other files up to 60 MB</div>';
  h += '<button class="upload-zone-btn" id="browse-btn">Browse Files</button>';
  h += '<input type="file" id="file-input" style="display:none">';
  h += "</div>";

  h += '<div class="upload-or">or upload from URL</div>';

  h += '<div class="upload-url-row">';
  h += '<input class="upload-url-input" id="url-input" type="text" placeholder="https://example.com/image.jpg">';
  h += '<button class="upload-url-btn" id="url-btn">Upload URL</button>';
  h += "</div>";

  h += '<div class="upload-form">';
  h += '<div class="upload-field">';
  h += '<label for="f-display-name">Display Name</label>';
  h += '<input id="f-display-name" type="text" placeholder="My asset" value="' + esc(capturedArgs.display_name || "") + '">';
  h += "</div>";
  h += '<div class="upload-field">';
  h += '<label for="f-tags">Tags</label>';
  h += '<input id="f-tags" type="text" placeholder="tag1, tag2, tag3" value="' + esc(Array.isArray(capturedArgs.tags) ? capturedArgs.tags.join(", ") : (capturedArgs.tags || "")) + '">';
  h += "</div>";
  h += '<div class="upload-field">';
  h += '<label for="f-folder">Asset Folder</label>';
  h += '<input id="f-folder" type="text" placeholder="my-folder" value="' + esc(capturedArgs.asset_folder || "") + '">';
  h += "</div>";
  h += '<div class="upload-field">';
  h += '<label for="f-public-id">Public ID</label>';
  h += '<input id="f-public-id" type="text" placeholder="(auto-generated)" value="' + esc(capturedArgs.public_id || "") + '">';
  h += "</div>";
  h += "</div>";

  root.innerHTML = h;
  setupDropZone();
}

function setupDropZone() {
  var zone = document.getElementById("drop-zone");
  var input = document.getElementById("file-input");
  var browseBtn = document.getElementById("browse-btn");
  var urlBtn = document.getElementById("url-btn");
  var urlInput = document.getElementById("url-input");

  browseBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    input.click();
  });
  zone.addEventListener("click", function() { input.click(); });

  input.addEventListener("change", function() {
    if (input.files && input.files.length) handleFiles(input.files);
  });

  zone.addEventListener("dragenter", function(e) { e.preventDefault(); zone.classList.add("dragover"); });
  zone.addEventListener("dragover", function(e) { e.preventDefault(); zone.classList.add("dragover"); });
  zone.addEventListener("dragleave", function(e) { e.preventDefault(); zone.classList.remove("dragover"); });
  zone.addEventListener("drop", function(e) {
    e.preventDefault();
    zone.classList.remove("dragover");
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files);
    }
  });

  urlBtn.addEventListener("click", function() {
    var url = urlInput.value.trim();
    if (url) handleUrl(url);
  });
  urlInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      var url = urlInput.value.trim();
      if (url) handleUrl(url);
    }
  });
}

function collectFormArgs() {
  var dn = document.getElementById("f-display-name");
  var tg = document.getElementById("f-tags");
  var fl = document.getElementById("f-folder");
  var pi = document.getElementById("f-public-id");

  if (dn && dn.value.trim()) capturedArgs.display_name = dn.value.trim();
  else delete capturedArgs.display_name;

  if (tg && tg.value.trim()) {
    capturedArgs.tags = tg.value.split(",").map(function(t) { return t.trim(); }).filter(Boolean).join(",");
  } else delete capturedArgs.tags;

  if (fl && fl.value.trim()) capturedArgs.asset_folder = fl.value.trim();
  else delete capturedArgs.asset_folder;

  if (pi && pi.value.trim()) capturedArgs.public_id = pi.value.trim();
  else delete capturedArgs.public_id;
}

function handleFiles(fileList) {
  var file = fileList[0];
  if (!file) return;

  collectFormArgs();
  renderUploading(file.name, fmtBytes(file.size));

  var reader = new FileReader();
  reader.onload = function() {
    doUpload(reader.result, file.name);
  };
  reader.onerror = function() {
    showError("Read Error", "Could not read the selected file.");
    renderPicker();
  };
  reader.readAsDataURL(file);
}

function handleUrl(url) {
  collectFormArgs();
  renderUploading(url, "Remote URL");
  doUpload(url, url);
}

function renderUploading(name, meta) {
  state = "uploading";
  var root = document.getElementById("app");
  var h = "";

  h += '<div class="upload-header">';
  h += '<span class="upload-header-icon">\\u2B06\\uFE0F</span>';
  h += '<h1>Uploading\\u2026</h1>';
  h += "</div>";

  h += '<div class="upload-preview">';
  h += '<div class="upload-preview-icon">\\u{1F4C4}</div>';
  h += '<div class="upload-preview-info">';
  h += '<div class="upload-preview-name">' + esc(name) + "</div>";
  h += '<div class="upload-preview-meta">' + esc(meta) + "</div>";
  h += "</div></div>";

  h += '<div class="upload-progress-wrap">';
  h += '<div class="upload-progress-bar"><div class="upload-progress-fill" id="progress-fill"></div></div>';
  h += '<div class="upload-progress-text" id="progress-text">Uploading to Cloudinary\\u2026</div>';
  h += "</div>";

  root.innerHTML = h;
  animateProgress();
}

var progressInterval = null;
function animateProgress() {
  clearInterval(progressInterval);
  var fill = document.getElementById("progress-fill");
  if (!fill) return;
  var pct = 0;
  progressInterval = setInterval(function() {
    if (pct < 90) {
      pct += (90 - pct) * 0.08;
      fill.style.width = pct + "%";
    }
  }, 200);
}

function stopProgress(success) {
  clearInterval(progressInterval);
  var fill = document.getElementById("progress-fill");
  var text = document.getElementById("progress-text");
  if (fill) fill.style.width = "100%";
  if (text) text.textContent = success ? "Upload complete" : "Upload failed";
}

async function doUpload(fileData, displayHint) {
  var uploadRequest = Object.assign({}, capturedArgs, { file: fileData });
  var resourceType = (pendingCall.args && pendingCall.args.resource_type) || "auto";

  console.log(LOG_PREFIX, "tools/call -> upload-asset");
  try {
    var res = await app.callServerTool({
      name: "upload-asset",
      arguments: { resource_type: resourceType, upload_request: uploadRequest },
    });
    var data = ingestResult(res);
    if (data && !data._truncated && !data.error && data.public_id) {
      stopProgress(true);
      setTimeout(function() { renderResult(data); }, 300);
    } else if (data && data.error) {
      stopProgress(false);
      var msg = data.error.message || JSON.stringify(data.error);
      showError("Upload Failed", msg);
      setTimeout(renderPicker, 1500);
    } else {
      stopProgress(false);
      showError("Upload Failed", "Unexpected response from server.");
      setTimeout(renderPicker, 1500);
    }
  } catch (e) {
    stopProgress(false);
    var errMsg = e && e.message ? e.message : String(e);
    showError("Upload Failed", errMsg);
    setTimeout(renderPicker, 1500);
  }
}

function renderResult(r) {
  state = "result";
  var root = document.getElementById("app");
  var url = r.secure_url || r.url || "";
  var name = r.display_name || r.public_id || "Asset";
  var fmt = (r.format || "").toUpperCase();
  var rt = r.resource_type || "";

  var h = "";

  h += '<div class="upload-header">';
  h += '<span class="upload-header-icon">\\u2705</span>';
  h += '<h1>Upload Complete</h1>';
  h += "</div>";

  h += '<div class="upload-result">';

  // Hero preview
  h += '<div class="upload-result-hero">';
  var thumb = thumbUrl(url, 500, 260, r);
  if (thumb) {
    h += '<img src="' + esc(thumb) + '">';
  } else if (rt === "raw") {
    h += '<div class="file-icon">' + fileTypeIcon(r.format);
    h += '<div class="file-icon-label">' + esc((r.format || "FILE").toUpperCase()) + "</div></div>";
  }
  h += "</div>";

  // Details
  h += '<div class="upload-result-body">';
  h += '<div class="upload-result-title"><span class="success-icon">\\u2713</span> ' + esc(name) + "</div>";

  h += '<div class="detail-section">';
  h += renderAssetGrid(r);
  h += "</div>";

  if (r.tags && r.tags.length) {
    h += renderTags(r.tags);
  }

  h += '<div class="upload-actions">';
  if (url) h += '<button class="prompt-btn prompt-btn-primary" id="open-url-btn">Open in Browser</button>';
  h += '<button class="prompt-btn" id="upload-another-btn">Upload Another</button>';
  h += "</div>";

  h += "</div></div>";

  root.innerHTML = h;

  root.addEventListener("click", function handler(e) {
    var el = e.target;
    while (el && el !== root) {
      if (el.id === "open-url-btn") {
        app._rpc("ui/open-link", { url: url });
        return;
      }
      if (el.id === "upload-another-btn") {
        renderPicker();
        return;
      }
      if (el.classList && el.classList.contains("link-val") && el.dataset.url) {
        app._rpc("ui/open-link", { url: el.dataset.url });
        return;
      }
      el = el.parentElement;
    }
  });
}

app.ontoolinput = function(params) {
  if (params.toolName) pendingCall.name = params.toolName;
  if (params.arguments) {
    pendingCall.args = params.arguments;
    capturedArgs = extractUploadArgs(params.arguments);
  }
};

app.ontoolresult = function(result) {
  if (result.toolName) pendingCall.name = result.toolName;

  var data = ingestResult(result);

  if (data && !data._truncated && !data.error && data.public_id) {
    console.log(LOG_PREFIX, "host upload result:", data.public_id);
    renderResult(data);
    return;
  }

  if (data && data.error) {
    console.warn(LOG_PREFIX, "host upload error:", data.error);
  } else {
    console.warn(LOG_PREFIX, "host result unusable, showing picker");
  }

  renderPicker();
};

app.connect().then(function() {
  console.log(LOG_PREFIX, "ready");
  setupResize(app, MIN_HEIGHT);
}).catch(function(err) {
  showError("Connection Failed", err && err.message ? err.message : String(err));
});
`;

const ASSET_UPLOAD_HTML = /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cloudinary Upload</title>
<style>
${SHARED_CSS_TOKENS}
${SHARED_CSS_COMPONENTS}
${UPLOAD_CSS}
</style>
</head>
<body>
<div id="app"><div class="status">Preparing upload&hellip;</div></div>

<script>
${SHARED_JS_MCP_CLIENT}
${SHARED_JS_HELPERS}
${SHARED_JS_MODAL}
${SHARED_JS_DETAIL_RENDERERS}
${SHARED_JS_HOST_CONTEXT}
${UPLOAD_JS}
</script>
</body>
</html>`;
