/*
 * MCP App for displaying Cloudinary assets in an interactive
 * gallery. Attached to list-images, list-videos, list-files, and
 * search-assets tools.
 *
 * Shares CLDS tokens, MCPApp client, helpers, and detail renderers
 * with the details app via app-shared.ts.
 */

import {
  SHARED_CSS_TOKENS,
  SHARED_CSS_COMPONENTS,
  SHARED_JS_ICONS,
  SHARED_JS_MCP_CLIENT,
  SHARED_JS_HELPERS,
  SHARED_JS_TOOLTIPS,
  SHARED_JS_MODAL,
  SHARED_JS_DETAIL_RENDERERS,
  SHARED_JS_HOST_CONTEXT,
} from "./app-shared.js";
import { injectToolName } from "./uri.js";

export function getAssetGalleryHtml(toolName?: string): string {
  return injectToolName(ASSET_GALLERY_HTML, toolName);
}

const GALLERY_CSS = /* css */ `
/* ── Header ── */
.header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: var(--cld-sp-sm);
}
.header-left { display: flex; align-items: center; gap: 10px; }
.header h1 {
  font-size: 13px; font-weight: 600; color: var(--cld-text);
}
.count-badge {
  font-size: var(--cld-font-xxs); color: var(--cld-text3); background: var(--cld-bg3);
  padding: 2px 8px; border-radius: 20px; font-weight: 500;
}
/* action-btn svg sizing */
.action-btn svg { width: 12px; height: 12px; fill: none; stroke: currentColor; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }
/* select bar svg */
.bar-btn svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }

/* ── Grid ── */
.grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--cld-sp-sm);
}

/* ── Card ── */
.card {
  position: relative; background: var(--cld-bg2); border: 2px solid transparent;
  border-radius: var(--cld-radius); overflow: hidden;
  transition: box-shadow 0.18s ease, transform 0.18s ease, border-color 0.18s ease;
  cursor: default; outline: none;
}
.card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.18); transform: translateY(-2px); }
.card.selected {
  border-color: var(--cld-accent);
  box-shadow: 0 0 0 1px var(--cld-accent), 0 6px 20px rgba(52,72,197,0.2);
}

/* Thumbnail */
.thumb {
  position: relative; width: 100%; aspect-ratio: 4/3; background: var(--cld-bg3);
  overflow: hidden; display: flex; align-items: center; justify-content: center;
}
.thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
.card:hover .thumb img { transform: scale(1.04); }
.thumb .badge {
  position: absolute; bottom: 6px; left: 6px; background: rgba(0,0,0,0.65);
  color: #fff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;
  text-transform: uppercase; letter-spacing: 0.5px; backdrop-filter: blur(4px);
  z-index: 2;
}
.thumb .placeholder { color: var(--cld-text3); font-size: 28px; }
.thumb .audio-placeholder { color: var(--cld-text3); font-size: 32px; font-weight: 700; }
.thumb.link:hover { opacity: 0.9; }

/* Selection checkbox */
.card-check {
  position: absolute; top: 8px; left: 8px; width: 20px; height: 20px;
  border-radius: 50%; background: rgba(255,255,255,0.9);
  border: 2px solid rgba(255,255,255,0.9);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.18s, background 0.18s;
  z-index: 5; box-shadow: 0 1px 4px rgba(0,0,0,0.25); pointer-events: none;
}
.card:hover .card-check, .card.selected .card-check { opacity: 1; pointer-events: auto; cursor: pointer; }
.card.selected .card-check { background: var(--cld-accent); border-color: var(--cld-accent); }
.card-check svg { width: 11px; height: 11px; opacity: 0; transition: opacity 0.18s; }
.card.selected .card-check svg { opacity: 1; }

/* Tags overlay on thumbnail */
.tags-overlay {
  position: absolute; top: 8px; right: 8px;
  display: flex; flex-wrap: wrap; gap: 4px; justify-content: flex-end;
  opacity: 0; transition: opacity 0.18s; z-index: 4; pointer-events: none;
}
.card:hover .tags-overlay { opacity: 1; }
.tag-overlay {
  font-size: 10px; color: white;
  background: rgba(10, 12, 18, 0.55); padding: 2px 7px; border-radius: 20px;
  backdrop-filter: blur(6px); font-weight: 600; letter-spacing: 0.02em;
}
/* Floating action buttons */
.card-actions {
  position: absolute; bottom: 10px; left: 0; right: 0;
  display: flex; align-items: center; justify-content: center; gap: 5px;
  opacity: 0; transform: translateY(6px);
  transition: opacity 0.18s, transform 0.18s; z-index: 5;
}
.card:hover .card-actions { opacity: 1; transform: translateY(0); }
.action-btn {
  height: 28px; padding: 0 11px; border-radius: 20px; border: none;
  font-size: 11px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; gap: 4px;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.25);
  font-family: inherit;
}
.action-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
.action-btn:active { transform: translateY(0); }
.action-btn.act-original { background: rgba(255,255,255,0.92); color: #111318; backdrop-filter: blur(8px); }
[data-theme="dark"] .action-btn.act-original { background: rgba(40,44,56,0.92); color: #e0e4ec; }
.action-btn.act-optimized { background: var(--cld-accent); color: white; }
.action-btn.act-download { background: rgba(10,12,18,0.7); color: white; backdrop-filter: blur(8px); padding: 0 9px; font-size: 13px; }
[data-theme="dark"] .action-btn.act-download { background: rgba(255,255,255,0.2); }

/* ── Info section ── */
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
.tag-more { background: var(--cld-bg3); color: var(--cld-text3); }
.card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
.date { font-size: 10px; color: var(--cld-text3); }
.details-link {
  font-size: 11px; color: var(--cld-accent); cursor: pointer;
  font-weight: 500; margin-left: auto;
}
.details-link:hover { text-decoration: underline; }

/* ── Skeleton loading ── */
.skeleton {
  background: linear-gradient(90deg, var(--cld-bg3) 25%, var(--cld-bg4) 50%, var(--cld-bg3) 75%);
  background-size: 200% 100%; animation: shimmer 1.4s infinite;
  border-radius: var(--cld-radius); aspect-ratio: 4/3;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Multi-select bar ── */
.select-bar {
  position: fixed; bottom: 16px; left: 50%;
  transform: translateX(-50%) translateY(80px);
  background: #1a1d24; color: white; border-radius: 40px;
  padding: 0 6px 0 16px; height: 48px;
  display: flex; align-items: center; gap: 4px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s;
  opacity: 0; pointer-events: none; z-index: 100; white-space: nowrap;
}
.select-bar.visible { transform: translateX(-50%) translateY(0); opacity: 1; pointer-events: all; }
.select-count { font-size: 13px; font-weight: 600; margin-right: 8px; }
.bar-btn {
  height: 36px; padding: 0 14px; border: none; border-radius: 30px;
  font-size: 12px; font-weight: 600; cursor: pointer;
  transition: background 0.18s; display: flex; align-items: center; gap: 6px;
  font-family: inherit;
}
.bar-btn.bar-primary { background: var(--cld-accent); color: white; }
.bar-btn.bar-primary:hover { opacity: 0.85; }
.bar-btn.bar-secondary { background: rgba(255,255,255,0.12); color: white; }
.bar-btn.bar-secondary:hover { background: rgba(255,255,255,0.2); }
.bar-btn.bar-ghost { background: none; color: rgba(255,255,255,0.6); padding: 0 10px; }
.bar-btn.bar-ghost:hover { color: white; }
.bar-divider { width: 1px; height: 20px; background: rgba(255,255,255,0.15); margin: 0 4px; }

/* ── Toast ── */
.gallery-toast {
  position: fixed; bottom: 86px; right: 20px;
  transform: translateY(20px);
  opacity: 0;
  background: #1a1d24; color: white;
  padding: 9px 18px; border-radius: 24px;
  font-size: 12px; font-weight: 600;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s;
  z-index: 999; pointer-events: none;
}
.gallery-toast.show { transform: translateY(0); opacity: 1; }
`;

const GALLERY_JS = /* js */ `
var LOG_PREFIX = "[gallery]";
var MIN_HEIGHT = 120;
var allResources = [];
var lastCursor = null;
var pendingCall = {
  name: (typeof window.__MCP_TOOL_NAME__ === "string" && window.__MCP_TOOL_NAME__) || null,
  args: null,
};
var selected = new Set();
var app = new MCPApp({ name: "Cloudinary Asset Gallery", version: "1.0.0" });
setupHostContext(app);

function optimizedUrl(url, resource) {
  if (!url) return "";
  if (resource && resource.resource_type === "raw") return url;
  return insertTransformation(url, "f_auto,q_auto", resource) || url;
}
function downloadUrl(url, resource) {
  if (!url) return "";
  return insertTransformation(url, "fl_attachment", resource) || url;
}

var _toastTimer;
function showToast(msg) {
  var t = document.getElementById("gallery-toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(function() { t.classList.remove("show"); }, 2000);
}

function updateSelectBar() {
  var bar = document.getElementById("select-bar");
  var countEl = document.getElementById("select-count");
  if (!bar || !countEl) return;
  var n = selected.size;
  countEl.textContent = n + " selected";
  bar.classList.toggle("visible", n > 0);
  var btn = document.getElementById("select-all-btn");
  if (btn) {
    var visible = getVisibleIndices();
    var allSelected = visible.length > 0 && visible.every(function(i) { return selected.has(i); });
    btn.textContent = allSelected ? "Deselect all" : "Select all";
  }
  var optBtn = document.getElementById("bar-copy-optimized");
  if (optBtn) {
    var hasOptimizable = false;
    selected.forEach(function(i) { var r = allResources[i]; if (r && r.resource_type !== "raw") hasOptimizable = true; });
    optBtn.style.display = hasOptimizable ? "" : "none";
  }
}

function getVisibleIndices() {
  var visible = [];
  for (var i = 0; i < allResources.length; i++) {
    var card = document.getElementById("card-" + i);
    if (card && card.style.display !== "none") visible.push(i);
  }
  return visible;
}

function toggleSelectAll() {
  var visible = getVisibleIndices();
  var allSelected = visible.length > 0 && visible.every(function(i) { return selected.has(i); });
  if (allSelected) {
    clearSelection();
  } else {
    for (var vi = 0; vi < visible.length; vi++) {
      selected.add(visible[vi]);
      var card = document.getElementById("card-" + visible[vi]);
      if (card) card.classList.add("selected");
    }
    updateSelectBar();
  }
}

function clearSelection() {
  selected.forEach(function(i) {
    var card = document.getElementById("card-" + i);
    if (card) card.classList.remove("selected");
  });
  selected.clear();
  updateSelectBar();
}

function toggleCard(idx) {
  var card = document.getElementById("card-" + idx);
  if (!card) return;
  if (selected.has(idx)) {
    selected.delete(idx);
    card.classList.remove("selected");
  } else {
    selected.add(idx);
    card.classList.add("selected");
  }
  updateSelectBar();
}

function copyAssetUrl(type, idx) {
  var r = allResources[idx];
  if (!r) return;
  var url = r.secure_url || r.url || "";
  var copyUrl = type === "optimized" ? optimizedUrl(url, r) : url;
  if (!copyUrl) return;
  copyText(copyUrl).then(function() {
    showToast(type === "optimized" ? "\\u2728 Optimized URL copied" : "URL copied");
  }).catch(function(e) { showError("Copy Failed", e && e.message ? e.message : String(e)); });
}

function downloadOne(idx) {
  var r = allResources[idx];
  if (!r) return;
  var url = r.secure_url || r.url || "";
  var dl = downloadUrl(url, r);
  if (!dl) return;
  app._rpc("ui/open-link", { url: dl });
  showToast("Downloading " + (r.display_name || r.filename || r.public_id || "asset"));
}

function copySelectedUrls(type) {
  var urls = [];
  selected.forEach(function(i) {
    var r = allResources[i];
    if (!r) return;
    var url = r.secure_url || r.url || "";
    urls.push(type === "optimized" ? optimizedUrl(url, r) : url);
  });
  if (!urls.length) return;
  copyText(urls.join("\\n")).then(function() {
    showToast(urls.length + " " + (type === "optimized" ? "optimized " : "") + "URLs copied");
  }).catch(function(e) { showError("Copy Failed", e && e.message ? e.message : String(e)); });
}

async function downloadSelected() {
  if (selected.size === 0) return;

  var picks = [];
  selected.forEach(function(i) {
    var r = allResources[i];
    if (r && r.public_id) picks.push(r);
  });
  if (!picks.length) return;

  var requestBody = {
    mode: "create",
    target_format: "zip",
    keep_derived: true,
    target_public_id: "mcp-gallery-archive-" + Date.now(),
    fully_qualified_public_ids: picks.map(function(r) {
      return (r.resource_type || "image") + "/" + (r.type || "upload") + "/" + r.public_id;
    }),
  };

  var btn = document.getElementById("bar-download");
  var origLabel = btn ? btn.innerHTML : "";
  if (btn) { btn.innerHTML = "Creating archive\\u2026"; btn.disabled = true; }

  try {
    var res = await app.callServerTool({
      name: "generate-archive",
      arguments: {
        resource_type: "all",
        RequestBody: requestBody,
      },
    });

    var data = ingestResult(res);
    if (data && (data._error || data._parseError)) {
      showError("Archive Failed", unwrapApiError(data._message));
      return;
    }
    var archiveUrl = data && (data.secure_url || data.url);
    if (!archiveUrl) {
      showError("Archive Failed", "No delivery URL returned.");
      return;
    }
    try { await copyText(archiveUrl); } catch (e) { /* ignore */ }
    app._rpc("ui/open-link", { url: archiveUrl });
    showToast("Archive saved as raw in Cloudinary \\u2014 opening URL (" + picks.length + " asset" + (picks.length > 1 ? "s" : "") + ")");
  } catch (e) {
    showError("Archive Failed", unwrapApiError(e && e.message ? e.message : String(e)));
  } finally {
    if (btn) { btn.innerHTML = origLabel; btn.disabled = false; }
  }
}

function unwrapApiError(raw) {
  if (!raw) return "Unknown error.";
  var msg = String(raw);
  try {
    if (msg.charAt(0) === "{") {
      var parsed = JSON.parse(msg);
      msg = (parsed && parsed.error && parsed.error.message) || msg;
    }
  } catch (e) { /* keep raw */ }
  return msg;
}

function render() {
  var root = document.getElementById("app");

  if (allResources.length === 0) {
    selected.clear();
    root.innerHTML = '<div class="status"><div class="icon">\\u{1F4F7}</div>No assets found.</div>';
    return;
  }

  var h = "";

  // Header
  h += '<div class="header">';
  h += '<div class="header-left">';
  h += '<h1>Results</h1>';
  h += '<span class="count-badge" id="count-badge">' + allResources.length + (lastCursor ? "+" : "") + ' items</span>';
  h += '</div>';
  h += '<div id="header-actions" style="display:flex;align-items:center;gap:8px">';
  h += '<button class="icon-btn" id="select-all-btn">Select all</button>';
  h += '<button class="icon-btn icon-only" id="refresh-gallery" title="Refresh">' + IC.refresh + '</button>';
  h += '</div>';
  h += '</div>';

  // Grid
  h += '<div class="grid" id="gallery-grid">';
  for (var i = 0; i < allResources.length; i++) {
    var r = allResources[i];
    var url = r.secure_url || r.url || "";
    var thumb = thumbUrl(url, 300, 225, r);
    var name = r.display_name || r.filename || r.public_id || "unknown";
    var fmt = (r.format || "").toUpperCase();
    var dims = (r.width && r.height) ? r.width + "\\u00d7" + r.height : "";
    var size = r.bytes ? fmtBytes(r.bytes) : "";
    var date = fmtDate(r.created_at);
    var tags = r.tags || [];
    var rt = r.resource_type || "";
    var audio = isAudioResource(r);
    var dur = r.duration ? fmtDuration(r.duration) : "";

    h += '<div class="card" id="card-' + i + '">';
    h += '<div class="thumb">';
    if (thumb) {
      h += '<img src="' + esc(thumb) + '" alt="' + esc(name) + '" loading="lazy" data-audio="' + (audio ? "1" : "") + '">';
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

    // Selection checkbox
    h += '<div class="card-check"><svg viewBox="0 0 12 12" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,6 5,9 10,3"/></svg></div>';

    // Tags overlay (capped at 3)
    if (tags.length) {
      var maxOverlay = 3;
      h += '<div class="tags-overlay" id="tags-overlay-' + i + '">';
      for (var ti = 0; ti < Math.min(tags.length, maxOverlay); ti++) h += '<span class="tag-overlay">' + esc(tags[ti]) + '</span>';
      if (tags.length > maxOverlay) h += '<span class="tag-overlay" title="' + esc(tags.slice(maxOverlay).join(", ")) + '">+' + (tags.length - maxOverlay) + '</span>';
      h += '</div>';
    }

    // Floating action buttons
    if (url) {
      h += '<div class="card-actions">';
      h += '<button class="action-btn act-original" data-copy-original="' + i + '">Copy URL</button>';
      if (rt !== "raw") h += '<button class="action-btn act-optimized" data-copy-optimized="' + i + '">' + IC.zap + ' Optimized</button>';
      h += '<button class="action-btn act-download" data-download="' + i + '" title="Download">' + IC.arrowDown + '</button>';
      h += '</div>';
    }

    if (fmt) h += '<span class="badge">' + esc(fmt) + "</span>";
    h += "</div>";

    // Info section
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
      var maxTags = 3;
      h += '<div class="tags">';
      for (var t = 0; t < Math.min(tags.length, maxTags); t++) h += '<span class="tag">' + esc(tags[t]) + "</span>";
      if (tags.length > maxTags) h += '<span class="tag tag-more" title="' + esc(tags.slice(maxTags).join(", ")) + '">+' + (tags.length - maxTags) + '</span>';
      h += "</div>";
    }

    h += '<div class="card-footer">';
    if (date) h += '<div class="date">' + date + "</div>";
    h += '<span class="details-link" data-idx="' + i + '">Details</span>';
    h += "</div>";

    h += "</div></div>";
  }
  h += "</div>";

  if (lastCursor) {
    h += '<div style="text-align:center;padding:16px 0;">';
    h += '<button class="prompt-btn prompt-btn-primary" id="load-more-btn">Load More</button>';
    h += "</div>";
  }

  // Multi-select bar
  h += '<div class="select-bar" id="select-bar">';
  h += '<span class="select-count" id="select-count">0 selected</span>';
  h += '<div class="bar-divider"></div>';
  h += '<button class="bar-btn bar-primary" id="bar-copy-optimized" style="display:none">' + IC.zap + ' Copy Optimized</button>';
  h += '<button class="bar-btn bar-secondary" id="bar-copy-original">Copy Original</button>';
  h += '<button class="bar-btn bar-secondary" id="bar-download">' + IC.arrowDown + ' Download Selected</button>';
  h += '<div class="bar-divider"></div>';
  h += '<button class="bar-btn bar-ghost" id="bar-clear">' + IC.x + '</button>';
  h += '</div>';

  // Toast
  h += '<div class="gallery-toast" id="gallery-toast"></div>';

  root.innerHTML = h;
  renderThemeToggle();

  // Re-apply selection state
  selected.forEach(function(i) {
    var card = document.getElementById("card-" + i);
    if (card) card.classList.add("selected");
  });
  updateSelectBar();

  // Image error fallback
  var imgs = root.querySelectorAll(".thumb img");
  for (var ii = 0; ii < imgs.length; ii++) {
    imgs[ii].addEventListener("error", function() {
      this.style.display = "none";
      var isAudio = this.getAttribute("data-audio") === "1";
      var ph = isAudio
        ? '<div class="audio-placeholder">\\u266B</div>'
        : '<span class="placeholder">\\u{1F5BC}</span>';
      this.parentElement.insertAdjacentHTML("afterbegin", ph);
    });
  }

  requestAnimationFrame(function() {
    app.reportSize(Math.max(document.documentElement.scrollHeight, MIN_HEIGHT));
  });
}

// One-time event delegation (survives re-renders)
var _eventsAttached = false;
function attachEvents() {
  if (_eventsAttached) return;
  _eventsAttached = true;
  var root = document.getElementById("app");

  root.addEventListener("click", function(e) {
    var el = e.target;
    while (el && el !== root) {
      if (el.id === "load-more-btn") { loadMore(); return; }
      if (el.id === "refresh-gallery") { refreshGallery(); return; }
      if (el.id === "select-all-btn") { toggleSelectAll(); return; }
      if (el.id === "bar-copy-optimized") { copySelectedUrls("optimized"); return; }
      if (el.id === "bar-copy-original") { copySelectedUrls("original"); return; }
      if (el.id === "bar-download") { downloadSelected(); return; }
      if (el.id === "bar-clear") { clearSelection(); return; }
      if (el.dataset && el.dataset.copyOriginal != null) {
        e.stopPropagation();
        copyAssetUrl("original", parseInt(el.dataset.copyOriginal, 10)); return;
      }
      if (el.dataset && el.dataset.copyOptimized != null) {
        e.stopPropagation();
        copyAssetUrl("optimized", parseInt(el.dataset.copyOptimized, 10)); return;
      }
      if (el.dataset && el.dataset.download != null) {
        e.stopPropagation();
        downloadOne(parseInt(el.dataset.download, 10)); return;
      }
      if (el.classList && el.classList.contains("card-check")) {
        var cardEl = el.closest(".card");
        if (cardEl) { var ci = parseInt(cardEl.id.replace("card-", ""), 10); if (!isNaN(ci)) toggleCard(ci); }
        return;
      }
      if (el.dataset && el.dataset.play != null) {
        playMedia(parseInt(el.dataset.play, 10)); return;
      }
      if (el.classList && el.classList.contains("details-link") && el.dataset.idx != null) {
        showDetails(parseInt(el.dataset.idx, 10)); return;
      }
      if (el.classList && el.classList.contains("link") && el.dataset.url) {
        app._rpc("ui/open-link", { url: el.dataset.url }); return;
      }
      if (el.classList && el.classList.contains("card")) {
        var idx = parseInt(el.id.replace("card-", ""), 10);
        if (!isNaN(idx)) toggleCard(idx);
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
    if (data && !data._error && !data._truncated && !data._parseError) {
      console.log(LOG_PREFIX, "details loaded for", r.asset_id);
      var modalBody = document.querySelector(".modal-body");
      if (modalBody) modalBody.innerHTML = renderFullDetails(data);
    } else {
      var errDetail = (data && data._message) ? data._message.substring(0, 300) : "Could not parse asset details from the server response.";
      var mb = document.querySelector(".modal-body");
      if (mb) mb.innerHTML = renderModalError("Unexpected Response", errDetail);
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
  if (params.name) pendingCall.name = params.name;
  if (params.arguments) pendingCall.args = params.arguments;
  showReadyPrompt(pendingCall, fetchDirect);
};

app.ontoolcancelled = function(params) {
  console.log(LOG_PREFIX, "tool cancelled:", params && params.reason);
  showCancelledPrompt(pendingCall, fetchDirect);
};

function resolveToolName(result) {
  if (typeof window.__MCP_TOOL_NAME__ === "string" && window.__MCP_TOOL_NAME__) {
    return window.__MCP_TOOL_NAME__;
  }
  var fromMeta = result && result._meta && result._meta["cloudinary/toolName"];
  if (fromMeta) return fromMeta;
  return pendingCall.name;
}

app.ontoolresult = function(result) {
  var data = ingestResult(result);
  var name = resolveToolName(result);
  if (name) pendingCall.name = name;
  if (data && data.resources) {
    console.log(LOG_PREFIX, "host result:", data.resources.length, "resources");
    allResources = data.resources;
    lastCursor = data.next_cursor || null;
    render(); attachEvents();
    return;
  }

  if (data && data._error) {
    showPersistentError("Error", data._message || JSON.stringify(data));
    return;
  }

  if (data && (data._truncated || data._parseError)) {
    console.log(LOG_PREFIX, "host result not JSON, auto-refetching as JSON");
    fetchDirect();
    return;
  }

  console.warn(LOG_PREFIX, "host result unusable");
  showFetchPrompt();
};

function showFetchPrompt() {
  var name = pendingCall.name;
  if (!name) {
    showPersistentError("Unknown Tool", "Could not determine which tool produced this result. Please retry from the host.");
    return;
  }
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
  renderThemeToggle();
  document.getElementById("fetch-direct-btn").addEventListener("click", function() { fetchDirect(); });
}

function jsonArgs(src) {
  var a = {};
  for (var k in src) a[k] = src[k];
  return a;
}

async function fetchDirect() {
  var name = pendingCall.name;
  if (!name) {
    showPersistentError("Unknown Tool", "Could not determine which tool to call. Please retry from the host.");
    return;
  }
  var args = jsonArgs(pendingCall.args || {});
  console.log(LOG_PREFIX, "fetchDirect ->", name);

  document.getElementById("app").innerHTML = '<div class="status">Fetching assets\\u2026</div>';
  try {
    var res = await app.callServerTool({ name: name, arguments: args });
    var data = ingestResult(res);
    if (data && data._error) {
      showPersistentError("Error", data._message || JSON.stringify(data));
    } else if (data && data.resources) {
      console.log(LOG_PREFIX, "direct fetch:", data.resources.length, "resources");
      allResources = data.resources;
      lastCursor = data.next_cursor || null;
      render(); attachEvents();
    } else {
      showPersistentError("No Data", "Server returned no assets.");
    }
  } catch (e) {
    showPersistentError("Fetch Failed", e && e.message ? e.message : String(e));
  }
}

async function loadMore() {
  if (!lastCursor) return;
  var name = pendingCall.name;
  if (!name) {
    showError("Unknown Tool", "Could not determine which tool to call for pagination.");
    return;
  }
  var args = name === "search-assets"
    ? { request: { next_cursor: lastCursor } }
    : { next_cursor: lastCursor };

  var btn = document.getElementById("load-more-btn");
  if (btn) { btn.textContent = "Loading\\u2026"; btn.disabled = true; }

  try {
    var res = await app.callServerTool({ name: name, arguments: args });
    var data = ingestResult(res);
    if (data && data.resources) {
      allResources = allResources.concat(data.resources);
      lastCursor = data.next_cursor || null;
      render(); attachEvents();
    } else {
      showError("No Data", "Server returned no additional assets.");
    }
  } catch (e) {
    showError("Load More Failed", e && e.message ? e.message : String(e));
    if (btn) { btn.textContent = "Load More"; btn.disabled = false; }
  }
}

function refreshGallery() {
  allResources = [];
  lastCursor = null;
  fetchDirect();
}


document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    if (document.querySelector(".modal-overlay")) { closeModal(); return; }
    if (selected.size > 0) { clearSelection(); return; }
  }
});

app.connect().then(function() {
  console.log(LOG_PREFIX, "ready");
  setupResize(app, MIN_HEIGHT);
}).catch(function(err) {
  console.warn(LOG_PREFIX, "connect failed:", err && err.message ? err.message : String(err));
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
<div class="gallery-toast" id="gallery-toast"></div>

<script>
${SHARED_JS_ICONS}
${SHARED_JS_MCP_CLIENT}
${SHARED_JS_HELPERS}
${SHARED_JS_TOOLTIPS}
${SHARED_JS_MODAL}
${SHARED_JS_DETAIL_RENDERERS}
${SHARED_JS_HOST_CONTEXT}
${GALLERY_JS}
</script>
</body>
</html>`;
