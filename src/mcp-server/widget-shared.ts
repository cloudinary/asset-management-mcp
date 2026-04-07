/*
 * Shared building blocks for MCP App widgets (gallery + details).
 * Each export is a raw string fragment to be interpolated into the
 * final HTML template literal of each widget.
 */

// ── CSS: CLDS Design Tokens (light + dark) ──────────────────────────
export const SHARED_CSS_TOKENS = /* css */ `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --cld-primary: #3448c5;
  --cld-primary-light: #4c64d7;
  --cld-bg: #ffffff;
  --cld-bg2: #f9fafb;
  --cld-bg3: #f3f4f7;
  --cld-bg4: #edeef3;
  --cld-text: #0a0c0f;
  --cld-text2: #333b4c;
  --cld-text3: #90a0b3;
  --cld-border: #d1d6e0;
  --cld-border2: #c2c9d6;
  --cld-accent: #3448c5;
  --cld-accent-bg: #f1f2f9;
  --cld-error: #CE190D;
  --cld-warning: #ff620c;
  --cld-success: #22AA00;
  --cld-radius: 8px;
  --cld-radius-sm: 4px;
  --cld-radius-lg: 16px;
  --cld-shadow-sm: 0 2px 4px 0 rgba(0,0,0,0.25);
  --cld-shadow-md: 0 4px 5px 0 rgba(0,0,0,0.2), 0 3px 14px 3px rgba(0,0,0,0.12), 0 8px 10px 1px rgba(0,0,0,0.14);
  --cld-shadow-lg: 0 24px 24px 0 rgba(0,0,0,0.3), 0 0 24px 0 rgba(0,0,0,0.22);
  --cld-sp-xxs: 0.25rem;
  --cld-sp-xs: 0.5rem;
  --cld-sp-sm: 0.75rem;
  --cld-sp-md: 1rem;
  --cld-sp-lg: 1.25rem;
  --cld-sp-xl: 2rem;
  --cld-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --cld-font-xxs: 0.75rem;
  --cld-font-xs: 0.875rem;
  --cld-font-sm: 1rem;
  --cld-chip-tag-bg: #f1f2f9;
  --cld-chip-tag-fg: #3448c5;
  --cld-chip-set-bg: #e6faf6;
  --cld-chip-set-fg: #13a5aa;
  --cld-chip-set-border: #b2e8e9;
  --cld-chip-date-bg: #fff8eb;
  --cld-chip-date-fg: #a16207;
  --cld-chip-date-border: #fde68a;
  --cld-chip-int-bg: #f5f0ff;
  --cld-chip-int-fg: #7c3aed;
  --cld-chip-int-border: #e9d5ff;
}

[data-theme="dark"], .dark {
  --cld-primary: #0D9AFF;
  --cld-primary-light: #51a3ff;
  --cld-bg: #1f242e;
  --cld-bg2: #14181e;
  --cld-bg3: #090c0f;
  --cld-bg4: #000000;
  --cld-text: #ffffff;
  --cld-text2: #d1d6e0;
  --cld-text3: #90a0b3;
  --cld-border: #3d475c;
  --cld-border2: #535f7a;
  --cld-accent: #0D9AFF;
  --cld-accent-bg: rgba(13,154,255,0.12);
  --cld-error: #ff5959;
  --cld-warning: #ffa359;
  --cld-success: #9affa6;
  --cld-chip-tag-bg: rgba(13,154,255,0.15);
  --cld-chip-tag-fg: #0D9AFF;
  --cld-chip-set-bg: rgba(72,208,216,0.15);
  --cld-chip-set-fg: #7dedff;
  --cld-chip-set-border: rgba(72,208,216,0.3);
  --cld-chip-date-bg: rgba(255,196,121,0.15);
  --cld-chip-date-fg: #ffc479;
  --cld-chip-date-border: rgba(255,196,121,0.3);
  --cld-chip-int-bg: rgba(167,111,255,0.15);
  --cld-chip-int-fg: #a76fff;
  --cld-chip-int-border: rgba(167,111,255,0.3);
}

body {
  font-family: var(--cld-font);
  background: var(--cld-bg);
  color: var(--cld-text);
  padding: var(--cld-sp-md);
  line-height: 1.5;
  font-size: var(--cld-font-xs);
}
`;

// ── CSS: Shared component styles ────────────────────────────────────
export const SHARED_CSS_COMPONENTS = /* css */ `
.link { cursor: pointer; }
.link:hover { color: var(--cld-accent); text-decoration: underline; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; backdrop-filter: blur(3px); padding: 24px;
}
.modal {
  background: var(--cld-bg); border: 1px solid var(--cld-border);
  border-radius: var(--cld-radius); width: 100%; max-width: 620px;
  max-height: 85vh; display: flex; flex-direction: column;
  box-shadow: var(--cld-shadow-lg); animation: modalIn 0.15s ease-out;
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.modal-header {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 20px; border-bottom: 1px solid var(--cld-border); flex-shrink: 0;
}
.modal-header-thumb {
  width: 40px; height: 40px; border-radius: 6px;
  object-fit: cover; background: var(--cld-bg3); flex-shrink: 0;
}
.modal-header-info { flex: 1; min-width: 0; }
.modal-header-info h2 {
  font-size: 14px; font-weight: 600;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.modal-header-sub { font-size: 11px; color: var(--cld-text3); margin-top: 2px; }
.modal-close {
  background: var(--cld-bg3); border: 1px solid var(--cld-border);
  width: 28px; height: 28px; border-radius: 6px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; color: var(--cld-text2); flex-shrink: 0; font-family: inherit;
}
.modal-close:hover { background: var(--cld-border); }
.modal-body { overflow-y: auto; padding: 0; }
.modal-hero {
  width: 100%; max-height: 220px; object-fit: contain;
  background: var(--cld-bg3); display: block;
}
.modal-loading { text-align: center; padding: 48px 20px; color: var(--cld-text2); font-size: 13px; }
.modal-loading .spinner {
  display: inline-block; width: 24px; height: 24px;
  border: 2.5px solid var(--cld-border); border-top-color: var(--cld-accent);
  border-radius: 50%; animation: spin 0.6s linear infinite; margin-bottom: 10px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Detail sections */
.detail-section { padding: 14px 20px; border-bottom: 1px solid var(--cld-bg3); }
.detail-section:last-child { border-bottom: none; }
.detail-section-title {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.8px; color: var(--cld-text3); margin-bottom: 10px;
  display: flex; align-items: center; gap: 6px;
}
.detail-section-title .count {
  background: var(--cld-bg3); padding: 1px 6px; border-radius: 8px;
  font-size: 10px; font-weight: 600; color: var(--cld-text2);
}
.detail-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1px;
  background: var(--cld-bg3); border-radius: var(--cld-radius-sm); overflow: hidden;
}
.detail-cell { background: var(--cld-bg); padding: 8px 12px; }
.detail-cell-key { font-size: 10px; color: var(--cld-text3); font-weight: 500; margin-bottom: 2px; }
.detail-cell-val { font-size: 12px; color: var(--cld-text); font-weight: 500; word-break: break-all; }
.detail-cell-val.link-val { color: var(--cld-accent); cursor: pointer; }
.detail-cell-val.link-val:hover { text-decoration: underline; }
.detail-cell.full-width { grid-column: 1 / -1; }

/* Chips */
.chip-list { display: flex; flex-wrap: wrap; gap: 5px; }
.chip { font-size: 11px; padding: 3px 10px; border-radius: 12px; font-weight: 500; white-space: nowrap; }
.chip-tag { background: var(--cld-chip-tag-bg); color: var(--cld-chip-tag-fg); }
.chip-set { background: var(--cld-chip-set-bg); color: var(--cld-chip-set-fg); border: 1px solid var(--cld-chip-set-border); }
.chip-date { background: var(--cld-chip-date-bg); color: var(--cld-chip-date-fg); border: 1px solid var(--cld-chip-date-border); }
.chip-int { background: var(--cld-chip-int-bg); color: var(--cld-chip-int-fg); border: 1px solid var(--cld-chip-int-border); }

/* Meta rows */
.meta-row {
  display: flex; align-items: baseline; padding: 6px 0;
  border-bottom: 1px solid var(--cld-bg3); gap: 8px; font-size: 12px;
}
.meta-row:last-child { border-bottom: none; }
.meta-key {
  color: var(--cld-text2); min-width: 0; flex-shrink: 0; max-width: 45%;
  font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px;
}
.meta-val { color: var(--cld-text); flex: 1; min-width: 0; text-align: right; }

/* Derived assets */
.derived-card {
  display: flex; align-items: center; gap: 10px; padding: 8px 0;
  border-bottom: 1px solid var(--cld-bg3); font-size: 11px;
}
.derived-card:last-child { border-bottom: none; }
.derived-thumb {
  width: 48px; height: 36px; border-radius: 4px;
  object-fit: cover; background: var(--cld-bg3); flex-shrink: 0;
}
.derived-info { flex: 1; min-width: 0; }
.derived-tx { color: var(--cld-text); font-family: monospace; font-size: 10px; word-break: break-all; }
.derived-meta { color: var(--cld-text3); font-size: 10px; margin-top: 2px; }
.derived-open { color: var(--cld-accent); cursor: pointer; font-weight: 500; white-space: nowrap; font-size: 11px; }
.derived-open:hover { text-decoration: underline; }

/* Error */
.modal-error { text-align: center; padding: 32px 20px; color: var(--cld-text2); font-size: 13px; }

/* Status / loading */
.status { text-align: center; padding: 48px 16px; color: var(--cld-text2); font-size: 14px; }
.status .icon { font-size: 32px; margin-bottom: 8px; }

/* Fetch prompt */
.prompt { text-align: center; padding: 48px 24px; color: var(--cld-text2); }
.prompt-icon { font-size: 36px; margin-bottom: 12px; }
.prompt-title { font-size: 15px; font-weight: 600; color: var(--cld-text); margin-bottom: 6px; }
.prompt-desc { font-size: 13px; max-width: 420px; margin: 0 auto 20px; line-height: 1.5; }
.prompt-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.prompt-btn {
  padding: 8px 20px; border-radius: var(--cld-radius); font-size: 13px; font-weight: 500;
  cursor: pointer; border: 1px solid var(--cld-border); background: var(--cld-bg2);
  color: var(--cld-text); font-family: inherit; transition: background 0.15s, border-color 0.15s;
}
.prompt-btn:hover { background: var(--cld-bg3); border-color: var(--cld-border2); }
.prompt-btn-primary { background: var(--cld-primary); color: #fff; border-color: var(--cld-primary); }
.prompt-btn-primary:hover { background: var(--cld-primary-light); border-color: var(--cld-primary-light); }

/* Error toast */
.error-toast {
  position: fixed; bottom: 16px; left: 16px; right: 16px;
  background: var(--cld-error); color: #fff; padding: 12px 16px;
  border-radius: var(--cld-radius); box-shadow: var(--cld-shadow-md);
  font-size: 13px; z-index: 2000; display: flex; align-items: flex-start;
  gap: 10px; animation: toastIn 0.2s ease-out; max-width: 600px; margin: 0 auto;
}
.error-toast-icon { font-size: 18px; flex-shrink: 0; line-height: 1; }
.error-toast-body { flex: 1; min-width: 0; }
.error-toast-title { font-weight: 600; margin-bottom: 2px; }
.error-toast-msg { font-size: 12px; opacity: 0.9; word-break: break-word; }
.error-toast-close {
  background: none; border: none; color: #fff; cursor: pointer;
  font-size: 16px; opacity: 0.8; padding: 0 2px; flex-shrink: 0; font-family: inherit;
}
.error-toast-close:hover { opacity: 1; }
@keyframes toastIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Thumb overlays */
.thumb-overlay {
  position: absolute; inset: 0; display: flex;
  align-items: center; justify-content: center; pointer-events: none;
}
.play-icon {
  width: 40px; height: 40px; background: rgba(0,0,0,0.55);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
}
.play-icon::after {
  content: ""; display: block; width: 0; height: 0;
  border-style: solid; border-width: 8px 0 8px 14px;
  border-color: transparent transparent transparent #fff; margin-left: 3px;
}
.audio-icon {
  width: 40px; height: 40px; background: rgba(0,0,0,0.55);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 18px;
}
.duration-badge {
  position: absolute; bottom: 6px; right: 6px;
  background: rgba(0,0,0,0.7); color: #fff; font-size: 10px;
  font-weight: 600; padding: 2px 6px; border-radius: 4px;
  font-variant-numeric: tabular-nums; backdrop-filter: blur(4px);
}
.file-icon {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 4px; color: var(--cld-text3);
}
.file-icon svg { width: 36px; height: 36px; }
.file-icon-label { font-size: 10px; font-weight: 600; text-transform: uppercase; }

/* Native media players */
.hero-video {
  width: 100%; max-height: 300px; display: block;
  background: #000; border-radius: 0;
}
.hero-audio-wrap {
  position: relative; padding: 20px;
  background: var(--cld-bg3); display: flex; flex-direction: column;
  align-items: center; gap: 12px;
}
.hero-audio-waveform {
  width: 100%; max-height: 120px; object-fit: contain; display: block;
  opacity: 0.6; border-radius: var(--cld-radius-sm);
}
.hero-audio-wrap audio { width: 100%; max-width: 500px; }
.hero-audio-note {
  font-size: 28px; color: var(--cld-text3); margin-bottom: 4px;
}
.media-modal-video {
  width: 100%; display: block; background: #000;
  max-height: 60vh;
}
.media-modal-audio-wrap {
  padding: 24px 20px; background: var(--cld-bg3);
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.media-modal-audio-wrap img {
  width: 100%; max-height: 100px; object-fit: contain; opacity: 0.6;
  border-radius: var(--cld-radius-sm);
}
.media-modal-audio-wrap audio { width: 100%; max-width: 480px; }
.thumb-overlay.playable { pointer-events: auto; cursor: pointer; }

/* Upload widget */
.upload-zone {
  border: 2px dashed var(--cld-border2); border-radius: var(--cld-radius);
  padding: 40px 24px; text-align: center; cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  background: var(--cld-bg2);
}
.upload-zone:hover { border-color: var(--cld-accent); background: var(--cld-accent-bg); }
.upload-zone.dragover { border-color: var(--cld-accent); background: var(--cld-accent-bg); }
.upload-zone-icon { font-size: 36px; margin-bottom: 8px; color: var(--cld-text3); }
.upload-zone-text { font-size: 14px; color: var(--cld-text2); margin-bottom: 4px; }
.upload-zone-hint { font-size: 12px; color: var(--cld-text3); }
.upload-zone-btn {
  display: inline-block; margin-top: 14px; padding: 8px 22px;
  border-radius: var(--cld-radius); font-size: 13px; font-weight: 500;
  cursor: pointer; border: 1px solid var(--cld-accent); background: var(--cld-accent);
  color: #fff; font-family: inherit; transition: background 0.15s;
}
.upload-zone-btn:hover { background: var(--cld-primary-light); border-color: var(--cld-primary-light); }
.upload-or { margin: 16px 0; font-size: 12px; color: var(--cld-text3); display: flex; align-items: center; gap: 10px; }
.upload-or::before, .upload-or::after { content: ""; flex: 1; height: 1px; background: var(--cld-border); }
.upload-url-row { display: flex; gap: 8px; }
.upload-url-input {
  flex: 1; padding: 8px 12px; border-radius: var(--cld-radius-sm);
  border: 1px solid var(--cld-border); background: var(--cld-bg);
  color: var(--cld-text); font-size: 13px; font-family: inherit; outline: none;
}
.upload-url-input:focus { border-color: var(--cld-accent); }
.upload-url-input::placeholder { color: var(--cld-text3); }
.upload-url-btn {
  padding: 8px 16px; border-radius: var(--cld-radius-sm);
  font-size: 13px; font-weight: 500; cursor: pointer;
  border: 1px solid var(--cld-accent); background: transparent;
  color: var(--cld-accent); font-family: inherit; transition: background 0.15s;
  white-space: nowrap;
}
.upload-url-btn:hover { background: var(--cld-accent-bg); }
.upload-params {
  margin-top: 16px; padding: 12px 16px; background: var(--cld-bg3);
  border-radius: var(--cld-radius-sm); font-size: 12px; color: var(--cld-text2);
}
.upload-params-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--cld-text3); margin-bottom: 6px; }
.upload-params .chip { margin-right: 4px; margin-bottom: 4px; }
.upload-preview {
  display: flex; align-items: center; gap: 14px; padding: 16px;
  background: var(--cld-bg2); border: 1px solid var(--cld-border);
  border-radius: var(--cld-radius); margin-bottom: 16px;
}
.upload-preview-thumb {
  width: 56px; height: 56px; border-radius: var(--cld-radius-sm);
  object-fit: cover; background: var(--cld-bg3); flex-shrink: 0;
}
.upload-preview-icon {
  width: 56px; height: 56px; border-radius: var(--cld-radius-sm);
  background: var(--cld-bg3); flex-shrink: 0; display: flex;
  align-items: center; justify-content: center; font-size: 24px; color: var(--cld-text3);
}
.upload-preview-info { flex: 1; min-width: 0; }
.upload-preview-name { font-size: 13px; font-weight: 600; color: var(--cld-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.upload-preview-meta { font-size: 11px; color: var(--cld-text3); margin-top: 2px; }
.upload-progress-wrap { margin-top: 8px; }
.upload-progress-bar {
  height: 6px; border-radius: 3px; background: var(--cld-bg3); overflow: hidden;
}
.upload-progress-fill {
  height: 100%; background: var(--cld-accent); border-radius: 3px;
  transition: width 0.3s ease; width: 0%;
}
.upload-progress-text { font-size: 11px; color: var(--cld-text3); margin-top: 4px; text-align: center; }
.upload-result {
  border: 1px solid var(--cld-border); border-radius: var(--cld-radius);
  overflow: hidden;
}
.upload-result-hero {
  position: relative; background: var(--cld-bg3);
  display: flex; align-items: center; justify-content: center; min-height: 120px;
}
.upload-result-hero img { width: 100%; max-height: 260px; object-fit: contain; display: block; }
.upload-result-hero .file-icon { padding: 30px 20px; }
.upload-result-body { padding: 16px; }
.upload-result-title {
  font-size: 15px; font-weight: 600; color: var(--cld-text); margin-bottom: 12px;
  display: flex; align-items: center; gap: 8px;
}
.upload-result-title .success-icon { color: var(--cld-success); font-size: 18px; }
.upload-actions { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
.upload-actions .prompt-btn { font-size: 12px; padding: 6px 16px; }

/* Upload form fields */
.upload-form {
  margin-top: 16px; display: grid; grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.upload-field { display: flex; flex-direction: column; gap: 3px; }
.upload-field.full-width { grid-column: 1 / -1; }
.upload-field label {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.6px; color: var(--cld-text3);
}
.upload-field input {
  padding: 7px 10px; border-radius: var(--cld-radius-sm);
  border: 1px solid var(--cld-border); background: var(--cld-bg);
  color: var(--cld-text); font-size: 13px; font-family: inherit; outline: none;
}
.upload-field input:focus { border-color: var(--cld-accent); }
.upload-field input::placeholder { color: var(--cld-text3); }
`;

// ── JS: MCPApp client class ─────────────────────────────────────────
export const SHARED_JS_MCP_CLIENT = /* js */ `
var RPC_TIMEOUT_MS = 15000;
var TOOL_CALL_TIMEOUT_MS = 30000;
var INIT_TIMEOUT_MS = 10000;

class MCPApp {
  constructor(info) {
    this.info = info;
    this.ontoolresult = null;
    this.ontoolinput = null;
    this.onhostcontextchanged = null;
    this._id = 1;
    this._pending = new Map();
    this._timers = new Map();
  }
  connect() {
    console.log(LOG_PREFIX, "connecting…");
    window.addEventListener("message", (ev) => {
      const m = ev.data;
      if (!m || m.jsonrpc !== "2.0") return;
      if (m.method) console.log(LOG_PREFIX, "recv notification:", m.method);
      else if (m.id != null) console.log(LOG_PREFIX, "recv response id=" + m.id);

      if (m.method === "ui/notifications/tool-result" && this.ontoolresult)
        this.ontoolresult(m.params);
      else if (m.method === "ui/notifications/tool-input" && this.ontoolinput)
        this.ontoolinput(m.params);
      else if (m.method === "ui/notifications/host-context-changed" && this.onhostcontextchanged)
        this.onhostcontextchanged(m.params);
      else if (m.id != null && this._pending.has(m.id)) {
        clearTimeout(this._timers.get(m.id));
        this._timers.delete(m.id);
        var cb = this._pending.get(m.id);
        this._pending.delete(m.id);
        if (m.error) {
          console.warn(LOG_PREFIX, "rpc error id=" + m.id, m.error);
          cb.reject(m.error);
        } else {
          cb.resolve(m.result);
        }
      }
    });
    return this._rpc("ui/initialize", {
      protocolVersion: "2026-01-26",
      appInfo: { name: this.info.name, version: this.info.version },
      appCapabilities: {},
    }, INIT_TIMEOUT_MS).then(function() {
      console.log(LOG_PREFIX, "initialized, sending initialized notification");
      window.parent.postMessage({ jsonrpc: "2.0", method: "ui/notifications/initialized" }, "*");
    });
  }
  callServerTool(params) {
    console.log(LOG_PREFIX, "calling tool:", params.name);
    return this._rpc("tools/call", params, TOOL_CALL_TIMEOUT_MS);
  }
  _rpc(method, params, timeoutMs) {
    var self = this;
    var id = this._id++;
    var ms = timeoutMs || RPC_TIMEOUT_MS;
    console.log(LOG_PREFIX, "rpc →", method, "id=" + id, "timeout=" + ms + "ms");
    return new Promise(function(resolve, reject) {
      self._pending.set(id, { resolve: resolve, reject: reject });
      var timer = setTimeout(function() {
        if (self._pending.has(id)) {
          self._pending.delete(id);
          self._timers.delete(id);
          var err = new Error("RPC timeout after " + ms + "ms: " + method + " (id=" + id + ")");
          console.error(LOG_PREFIX, err.message);
          reject(err);
        }
      }, ms);
      self._timers.set(id, timer);
      window.parent.postMessage({ jsonrpc: "2.0", id: id, method: method, params: params }, "*");
    });
  }
  reportSize(height) {
    window.parent.postMessage({
      jsonrpc: "2.0", method: "ui/notifications/size-changed", params: { height: height },
    }, "*");
  }
}
`;

// ── JS: Helper functions ────────────────────────────────────────────
export const SHARED_JS_HELPERS = /* js */ `
function fmtBytes(b) {
  if (!b) return "";
  var u = ["B","KB","MB","GB"], i = Math.min(Math.floor(Math.log(b)/Math.log(1024)), 3);
  var v = b / Math.pow(1024, i);
  return (v < 10 ? v.toFixed(1) : Math.round(v)) + " " + u[i];
}

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
}

function fmtDuration(sec) {
  if (sec == null || sec <= 0) return "";
  var s = Math.round(sec);
  var m = Math.floor(s / 60);
  s = s % 60;
  return m + ":" + (s < 10 ? "0" : "") + s;
}

function isAudioResource(r) {
  if (!r) return false;
  return r.is_audio === true || (r.resource_type === "video" && !r.width && !r.height);
}

function thumbUrl(url, w, h, resource) {
  if (!url) return "";
  w = w || 300; h = h || 225;
  var rt = (resource && resource.resource_type) || "";
  var fmt = (resource && resource.format || "").toLowerCase();

  if (rt === "raw") return "";

  if (isAudioResource(resource)) {
    var base = url.replace(/\\.[^/.]+$/, ".png");
    return base.replace(
      /\\/(upload|fetch|private|authenticated)\\//,
      "/$1/c_scale,w_" + w + ",h_" + h + "/fl_waveform,b_transparent,co_rgb:3448c5/"
    );
  }

  if (rt === "video") {
    return url.replace(
      /\\/(upload|fetch|private|authenticated)\\//,
      "/$1/c_fill,g_auto,w_" + w + ",h_" + h + ",so_auto,f_jpg,q_auto/"
    );
  }

  if (fmt === "pdf") {
    return url.replace(
      /\\/(upload|fetch|private|authenticated)\\//,
      "/$1/c_fill,w_" + w + ",h_" + h + ",pg_1,f_auto,q_auto/"
    );
  }

  return url.replace(
    /\\/(upload|fetch|private|authenticated)\\//,
    "/$1/c_fill,g_auto,w_" + w + ",h_" + h + ",f_auto,q_auto/"
  );
}

function mediaUrl(url, resource) {
  if (!url) return "";
  var rt = (resource && resource.resource_type) || "";
  if (rt !== "video") return url;
  return url.replace(
    /\/(upload|fetch|private|authenticated)\//,
    "/$1/q_auto/"
  );
}

function esc(s) {
  var d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function prettyKey(k) {
  return k.replace(/_/g, " ").replace(/\\b\\w/g, function(c) { return c.toUpperCase(); });
}

var FILE_TYPE_ICONS = {
  pdf:  '<svg viewBox="0 0 36 36" fill="none"><rect x="6" y="2" width="24" height="32" rx="3" fill="#E8384F" opacity="0.15" stroke="#E8384F" stroke-width="1.5"/><text x="18" y="22" text-anchor="middle" fill="#E8384F" font-size="9" font-weight="700">PDF</text></svg>',
  zip:  '<svg viewBox="0 0 36 36" fill="none"><rect x="6" y="2" width="24" height="32" rx="3" fill="#F5A623" opacity="0.15" stroke="#F5A623" stroke-width="1.5"/><text x="18" y="22" text-anchor="middle" fill="#F5A623" font-size="9" font-weight="700">ZIP</text></svg>',
  doc:  '<svg viewBox="0 0 36 36" fill="none"><rect x="6" y="2" width="24" height="32" rx="3" fill="#2B7CFF" opacity="0.15" stroke="#2B7CFF" stroke-width="1.5"/><text x="18" y="22" text-anchor="middle" fill="#2B7CFF" font-size="9" font-weight="700">DOC</text></svg>',
  xls:  '<svg viewBox="0 0 36 36" fill="none"><rect x="6" y="2" width="24" height="32" rx="3" fill="#22AA00" opacity="0.15" stroke="#22AA00" stroke-width="1.5"/><text x="18" y="22" text-anchor="middle" fill="#22AA00" font-size="9" font-weight="700">XLS</text></svg>',
  csv:  '<svg viewBox="0 0 36 36" fill="none"><rect x="6" y="2" width="24" height="32" rx="3" fill="#22AA00" opacity="0.15" stroke="#22AA00" stroke-width="1.5"/><text x="18" y="22" text-anchor="middle" fill="#22AA00" font-size="9" font-weight="700">CSV</text></svg>',
  json: '<svg viewBox="0 0 36 36" fill="none"><rect x="6" y="2" width="24" height="32" rx="3" fill="#7c3aed" opacity="0.15" stroke="#7c3aed" stroke-width="1.5"/><text x="18" y="22" text-anchor="middle" fill="#7c3aed" font-size="8" font-weight="700">JSON</text></svg>',
  _default: '<svg viewBox="0 0 36 36" fill="none"><rect x="6" y="2" width="24" height="32" rx="3" fill="#90a0b3" opacity="0.15" stroke="#90a0b3" stroke-width="1.5"/><path d="M14 14h8M14 18h8M14 22h5" stroke="#90a0b3" stroke-width="1.2" stroke-linecap="round"/></svg>',
};
FILE_TYPE_ICONS.docx = FILE_TYPE_ICONS.doc;
FILE_TYPE_ICONS.xlsx = FILE_TYPE_ICONS.xls;
FILE_TYPE_ICONS.rar = FILE_TYPE_ICONS.zip;
FILE_TYPE_ICONS["7z"] = FILE_TYPE_ICONS.zip;
FILE_TYPE_ICONS.xml = FILE_TYPE_ICONS.json;

function fileTypeIcon(format) {
  var f = (format || "").toLowerCase();
  return FILE_TYPE_ICONS[f] || FILE_TYPE_ICONS._default;
}

var errorToastTimer = null;
function showError(title, msg) {
  console.error(LOG_PREFIX, title, msg);
  dismissError();
  var h = '<div class="error-toast" id="error-toast">';
  h += '<span class="error-toast-icon">\\u26A0</span>';
  h += '<div class="error-toast-body">';
  h += '<div class="error-toast-title">' + esc(title) + "</div>";
  if (msg) h += '<div class="error-toast-msg">' + esc(msg) + "</div>";
  h += "</div>";
  h += '<button class="error-toast-close" onclick="dismissError()">\\u2715</button>';
  h += "</div>";
  document.body.insertAdjacentHTML("beforeend", h);
  errorToastTimer = setTimeout(dismissError, 8000);
}

function dismissError() {
  clearTimeout(errorToastTimer);
  var el = document.getElementById("error-toast");
  if (el) el.remove();
}

function ingestResult(params) {
  try {
    var payload = params.result || params;
    var content = payload.content || [];
    var text = content.find(function(c) { return c.type === "text"; });
    if (!text) return null;
    var raw = text.text;
    if (typeof raw === "string" && raw.charAt(0) !== "{" && raw.charAt(0) !== "[") {
      console.warn(LOG_PREFIX, "ingestResult: text is not JSON, likely truncated:", raw.substring(0, 120));
      return { _truncated: true, _message: raw };
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn(LOG_PREFIX, "ingestResult parse error:", e);
    return null;
  }
}

function renderModalError(title, detail) {
  return '<div class="modal-error" style="padding:40px 20px;text-align:center;">'
    + '<div style="font-size:28px;margin-bottom:8px;">\\u26A0\\uFE0F</div>'
    + '<div style="font-weight:600;font-size:14px;color:var(--cld-text);margin-bottom:6px;">' + esc(title) + "</div>"
    + '<div style="font-size:12px;color:var(--cld-text3);max-width:400px;margin:0 auto;">' + esc(detail) + "</div>"
    + "</div>";
}
`;

// ── JS: Modal system ────────────────────────────────────────────────
export const SHARED_JS_MODAL = /* js */ `
function closeModal() {
  var ov = document.querySelector(".modal-overlay");
  if (ov) ov.remove();
}

function openModal(headerHtml, bodyHtml) {
  closeModal();
  var h = '<div class="modal-overlay"><div class="modal">';
  h += headerHtml;
  h += '<div class="modal-body">' + bodyHtml + "</div>";
  h += "</div></div>";
  document.body.insertAdjacentHTML("beforeend", h);

  var overlay = document.querySelector(".modal-overlay");
  overlay.addEventListener("click", function(e) {
    if (e.target === overlay || e.target.classList.contains("modal-close")) {
      closeModal();
      return;
    }
    var el = e.target;
    while (el && el !== overlay) {
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
  document.addEventListener("keydown", function onEsc(e) {
    if (e.key === "Escape") { closeModal(); document.removeEventListener("keydown", onEsc); }
  });
}

function modalHeader(name, url, sub, resource) {
  var h = '<div class="modal-header">';
  var thumb = thumbUrl(url, 60, 60, resource);
  if (thumb) h += '<img class="modal-header-thumb" src="' + esc(thumb) + '">';
  h += '<div class="modal-header-info">';
  h += '<h2>' + esc(name) + "</h2>";
  if (sub) h += '<div class="modal-header-sub">' + esc(sub) + "</div>";
  h += "</div>";
  h += '<button class="modal-close" title="Close">\\u2715</button>';
  h += "</div>";
  return h;
}
`;

// ── JS: Detail rendering functions ──────────────────────────────────
export const SHARED_JS_DETAIL_RENDERERS = /* js */ `
function renderAssetGrid(r) {
  var fields = [
    ["Public ID", r.public_id],
    ["Asset ID", r.asset_id],
    ["Display Name", r.display_name],
    ["Format", (r.format || "").toUpperCase()],
    ["Resource Type", r.resource_type],
    ["Type", r.type],
    ["Dimensions", (r.width && r.height) ? r.width + " \\u00d7 " + r.height : ""],
    ["Duration", r.duration ? fmtDuration(r.duration) + " (" + r.duration.toFixed(2) + "s)" : ""],
    ["File Size", r.bytes ? fmtBytes(r.bytes) + " (" + r.bytes.toLocaleString() + " bytes)" : ""],
    ["Created", fmtDate(r.created_at)],
    ["Access Mode", r.access_mode],
    ["Asset Folder", r.asset_folder || "\\u2014"],
    ["Version", r.version],
    ["Backup", r.backup != null ? String(r.backup) : ""],
  ];
  if (r.is_audio) fields.push(["Audio", "Yes"]);
  if (r.audio_codec) fields.push(["Audio Codec", r.audio_codec]);
  if (r.audio_frequency) fields.push(["Audio Frequency", r.audio_frequency + " Hz"]);
  if (r.channels) fields.push(["Channels", r.channel_layout ? r.channels + " (" + r.channel_layout + ")" : String(r.channels)]);
  if (r.bit_rate) fields.push(["Bit Rate", Math.round(r.bit_rate / 1000) + " kbps"]);

  var h = '<div class="detail-grid">';
  for (var i = 0; i < fields.length; i++) {
    if (!fields[i][1] && fields[i][1] !== 0) continue;
    h += '<div class="detail-cell">';
    h += '<div class="detail-cell-key">' + esc(fields[i][0]) + "</div>";
    h += '<div class="detail-cell-val">' + esc(String(fields[i][1])) + "</div>";
    h += "</div>";
  }
  h += "</div>";

  if (r.url || r.secure_url) {
    h += '<div style="margin-top:10px">';
    if (r.url) {
      h += '<div class="meta-row"><span class="meta-key">URL</span>';
      h += '<span class="meta-val link-val detail-cell-val" data-url="' + esc(r.url) + '">' + esc(r.url) + "</span></div>";
    }
    if (r.secure_url) {
      h += '<div class="meta-row"><span class="meta-key">Secure URL</span>';
      h += '<span class="meta-val link-val detail-cell-val" data-url="' + esc(r.secure_url) + '">' + esc(r.secure_url) + "</span></div>";
    }
    h += "</div>";
  }
  return h;
}

function renderTags(tags) {
  if (!tags || !tags.length) return "";
  var h = '<div class="detail-section">';
  h += '<div class="detail-section-title">Tags <span class="count">' + tags.length + "</span></div>";
  h += '<div class="chip-list">';
  for (var i = 0; i < tags.length; i++) {
    h += '<span class="chip chip-tag">' + esc(tags[i]) + "</span>";
  }
  h += "</div></div>";
  return h;
}

function classifyMetaVal(v) {
  if (Array.isArray(v)) return "set";
  if (typeof v === "number") return "int";
  if (typeof v === "string" && /^\\d{4}-\\d{2}-\\d{2}/.test(v)) return "date";
  return "string";
}

function renderMetadata(meta) {
  if (!meta) return "";
  var keys = Object.keys(meta);
  if (!keys.length) return "";

  var groups = { string: [], int: [], date: [], set: [] };
  for (var i = 0; i < keys.length; i++) {
    var t = classifyMetaVal(meta[keys[i]]);
    groups[t].push({ key: keys[i], val: meta[keys[i]] });
  }

  var h = '<div class="detail-section">';
  h += '<div class="detail-section-title">Structured Metadata <span class="count">' + keys.length + "</span></div>";

  if (groups.set.length) {
    for (var s = 0; s < groups.set.length; s++) {
      var item = groups.set[s];
      h += '<div class="meta-row" style="flex-direction:column;gap:4px">';
      h += '<span class="meta-key" style="max-width:100%">' + esc(prettyKey(item.key)) + "</span>";
      h += '<div class="chip-list">';
      for (var si = 0; si < item.val.length; si++) {
        h += '<span class="chip chip-set">' + esc(String(item.val[si])) + "</span>";
      }
      h += "</div></div>";
    }
  }
  if (groups.date.length) {
    for (var d = 0; d < groups.date.length; d++) {
      h += '<div class="meta-row">';
      h += '<span class="meta-key" title="' + esc(groups.date[d].key) + '">' + esc(prettyKey(groups.date[d].key)) + "</span>";
      h += '<span class="meta-val"><span class="chip chip-date">' + esc(groups.date[d].val) + "</span></span></div>";
    }
  }
  if (groups.int.length) {
    for (var n = 0; n < groups.int.length; n++) {
      h += '<div class="meta-row">';
      h += '<span class="meta-key" title="' + esc(groups.int[n].key) + '">' + esc(prettyKey(groups.int[n].key)) + "</span>";
      h += '<span class="meta-val"><span class="chip chip-int">' + esc(String(groups.int[n].val)) + "</span></span></div>";
    }
  }
  if (groups.string.length) {
    for (var st = 0; st < groups.string.length; st++) {
      h += '<div class="meta-row">';
      h += '<span class="meta-key" title="' + esc(groups.string[st].key) + '">' + esc(prettyKey(groups.string[st].key)) + "</span>";
      h += '<span class="meta-val">' + esc(String(groups.string[st].val)) + "</span></div>";
    }
  }

  h += "</div>";
  return h;
}

function renderDerived(derived) {
  if (!derived || !derived.length) return "";
  var h = '<div class="detail-section">';
  h += '<div class="detail-section-title">Derived Assets <span class="count">' + derived.length + "</span></div>";
  for (var i = 0; i < derived.length; i++) {
    var d = derived[i];
    var dUrl = d.secure_url || d.url || "";
    h += '<div class="derived-card">';
    if (dUrl) h += '<img class="derived-thumb" src="' + esc(dUrl) + '">';
    h += '<div class="derived-info">';
    h += '<div class="derived-tx">' + esc(d.transformation || "") + "</div>";
    h += '<div class="derived-meta">' + (d.format || "").toUpperCase() + " &middot; " + fmtBytes(d.bytes) + "</div>";
    h += "</div>";
    if (dUrl) h += '<span class="derived-open" data-url="' + esc(dUrl) + '">Open</span>';
    h += "</div>";
  }
  h += "</div>";
  return h;
}

function renderLastUpdated(lu) {
  if (!lu) return "";
  var keys = Object.keys(lu);
  if (!keys.length) return "";
  var h = '<div class="detail-section">';
  h += '<div class="detail-section-title">Timestamps</div>';
  h += '<div class="detail-grid">';
  for (var i = 0; i < keys.length; i++) {
    h += '<div class="detail-cell">';
    h += '<div class="detail-cell-key">' + esc(prettyKey(keys[i])) + "</div>";
    h += '<div class="detail-cell-val">' + esc(fmtDate(lu[keys[i]])) + "</div>";
    h += "</div>";
  }
  h += "</div></div>";
  return h;
}

function renderHeroPreview(r) {
  var url = r.secure_url || r.url || "";
  var rt = r.resource_type || "";
  var h = "";

  if (rt === "raw") {
    h += '<div style="text-align:center;padding:30px 20px;background:var(--cld-bg3)">';
    h += '<div class="file-icon">' + fileTypeIcon(r.format);
    h += '<div class="file-icon-label">' + esc((r.format || "FILE").toUpperCase()) + "</div></div></div>";
    return h;
  }

  if (isAudioResource(r)) {
    var waveform = thumbUrl(url, 600, 120, r);
    h += '<div class="hero-audio-wrap">';
    if (waveform) {
      h += '<img class="hero-audio-waveform" src="' + esc(waveform) + '">';
    } else {
      h += '<div class="hero-audio-note">\\u266B</div>';
    }
    h += '<audio controls preload="metadata" src="' + esc(mediaUrl(url, r)) + '"></audio>';
    h += "</div>";
    return h;
  }

  if (rt === "video") {
    var poster = thumbUrl(url, 600, 300, r);
    var src = mediaUrl(url, r);
    h += '<div style="position:relative">';
    h += '<video class="hero-video" controls preload="metadata"';
    if (poster) h += ' poster="' + esc(poster) + '"';
    h += '><source src="' + esc(src) + '"></video>';
    if (r.duration) {
      h += '<div class="duration-badge">' + fmtDuration(r.duration) + "</div>";
    }
    h += "</div>";
    return h;
  }

  var thumb = thumbUrl(url, 600, 220, r);
  if (thumb) {
    h += '<img class="modal-hero" src="' + esc(thumb) + '">';
  }
  return h;
}

function renderMediaModalBody(r) {
  var url = r.secure_url || r.url || "";
  var h = "";

  if (isAudioResource(r)) {
    var waveform = thumbUrl(url, 560, 100, r);
    h += '<div class="media-modal-audio-wrap">';
    if (waveform) h += '<img src="' + esc(waveform) + '">';
    h += '<audio controls autoplay preload="metadata" src="' + esc(mediaUrl(url, r)) + '"></audio>';
    h += "</div>";
    return h;
  }

  var poster = thumbUrl(url, 600, 340, r);
  h += '<video class="media-modal-video" controls autoplay preload="metadata"';
  if (poster) h += ' poster="' + esc(poster) + '"';
  h += '><source src="' + esc(mediaUrl(url, r)) + '"></video>';
  return h;
}

function renderFullDetails(r) {
  var body = renderHeroPreview(r);

  body += '<div class="detail-section"><div class="detail-section-title">Asset Info</div>';
  body += renderAssetGrid(r);
  body += "</div>";

  body += renderTags(r.tags);
  body += renderLastUpdated(r.last_updated);
  body += renderMetadata(r.metadata);
  body += renderDerived(r.derived);

  return body;
}
`;

// ── JS: Host context handler ────────────────────────────────────────
export const SHARED_JS_HOST_CONTEXT = /* js */ `
function setupHostContext(app) {
  app.onhostcontextchanged = function(ctx) {
    if (ctx.theme)
      document.documentElement.setAttribute("data-theme", ctx.theme);
    if (ctx.styles && ctx.styles.variables) {
      var vars = ctx.styles.variables;
      for (var k in vars) document.documentElement.style.setProperty(k, vars[k]);
    }
    if (ctx.styles && ctx.styles.css && ctx.styles.css.fonts) {
      var el = document.getElementById("host-fonts");
      if (!el) { el = document.createElement("style"); el.id = "host-fonts"; document.head.appendChild(el); }
      el.textContent = ctx.styles.css.fonts;
    }
    if (ctx.safeAreaInsets) {
      var s = ctx.safeAreaInsets;
      document.body.style.padding =
        (s.top||0)+"px "+(s.right||0)+"px "+(s.bottom||0)+"px "+(s.left||0)+"px";
    }
  };
}

function setupResize(app, minHeight) {
  var _raf = 0;
  function report() {
    cancelAnimationFrame(_raf);
    _raf = requestAnimationFrame(function() {
      app.reportSize(Math.max(document.documentElement.scrollHeight, minHeight));
    });
  }
  var ro = new ResizeObserver(report);
  ro.observe(document.body);
  ro.observe(document.documentElement);
  report();
}
`;
