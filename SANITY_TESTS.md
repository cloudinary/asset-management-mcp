# MCP Server Sanity Tests

Manual test plan covering all 23 tools. Tests are grouped into phases that build on each other — run them in order so that assets created in earlier steps are available for later ones.

## Prerequisites

Start the server with header collection enabled:

```bash
CLOUDINARY_COLLECT_HEADERS=x-request-id,x-featureratelimit-limit,x-featureratelimit-remaining,x-featureratelimit-reset \
  node bin/mcp-server.js start --transport sse --log-level debug
```

Verify the `_headers` object appears in every response that returns JSON.

---

## Phase 1: Read-only tools (no side effects)

### 1.1 get-usage-details

```
get-usage-details
```

Expect: Account usage stats (plan, credits, storage, bandwidth, resources count).

### 1.2 list-images

```
list-images  max_results=3  fields=["filename","format","bytes","width","height"]
```

Expect: Array of up to 3 image resources with requested fields.

### 1.3 list-videos

```
list-videos  max_results=3  fields=["filename","format","bytes"]
```

Expect: Array of video resources (may be empty if no videos exist).

### 1.4 list-files

```
list-files  max_results=3
```

Expect: Array of raw file resources (may be empty).

### 1.5 list-tags

```
list-tags  resource_type="image"  max_results=5
```

Expect: Array of tag strings.

### 1.6 search-assets

```
search-assets  expression="resource_type:image AND format:jpg"  max_results=2
```

Expect: `total_count`, `time`, and `resources` array with matching assets.

### 1.7 search-folders

```
search-folders  max_results=5
```

Expect: Array of folders with `name`, `path`, `created_at`.

### 1.8 get-tx-reference

```
get-tx-reference
```

Expect: Full markdown document with Cloudinary transformation rules. Verify it starts with `# Cloudinary Transformation Rules Documentation`.

---

## Phase 2: Upload and asset creation

### 2.1 upload-asset (remote URL)

```
upload-asset
  resource_type="image"
  upload_request={
    "file": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    "public_id": "sanity-test-upload",
    "tags": "sanity-test"
  }
```

Expect: Full upload response with `asset_id`, `public_id`, dimensions, `secure_url`.
Save the returned `asset_id` for later tests.

### 2.2 upload-asset (local file)

```
upload-asset
  upload_request={
    "file": "file:///path/to/a/local/image.jpg",
    "public_id": "sanity-test-local-upload",
    "tags": "sanity-test"
  }
```

Expect: Successful upload. Verifies the `file://` to base64 conversion in the auth hook.

### 2.3 create-folder

```
create-folder  folder="sanity-test-folder"
```

Expect: Folder created successfully.

---

## Phase 3: Read details of created assets

### 3.1 get-asset-details

```
get-asset-details  asset_id="<asset_id from 2.1>"
```

Expect: Full asset details including `public_id`, `format`, `bytes`, `width`, `height`, `secure_url`.

### 3.2 search-assets (by tag)

```
search-assets  expression="tags:sanity-test"  max_results=10
```

Expect: Both uploaded assets from Phase 2 appear in results.

### 3.3 visual-search-assets

```
visual-search-assets  request={"text": "landscape with mountains"}
```

Expect: Array of visually similar image results (may vary by account content).

---

## Phase 4: Transform

### 4.1 transform-asset (fill + auto format)

```
transform-asset
  publicId="sanity-test-upload"
  transformations="c_fill,g_auto,h_300,w_400/f_auto/q_auto"
```

Expect: Full response with `eager` array containing:
- `transformation` string
- `width: 400`, `height: 300`
- `bytes`, `format`, `secure_url`

### 4.2 transform-asset (effect + format conversion)

```
transform-asset
  publicId="sanity-test-upload"
  transformations="e_sepia/c_scale,w_600/f_webp/q_80"
```

Expect: `eager` array with `format: "webp"`, `width: 600`.

### 4.3 transform-asset (circular thumbnail)

```
transform-asset
  publicId="sanity-test-upload"
  transformations="c_thumb,g_face,h_200,w_200/r_max/f_png"
```

Expect: `eager` array with `format: "png"`, `width: 200`, `height: 200`.

---

## Phase 5: Update and mutate

### 5.1 asset-update (add context and tags)

```
asset-update
  asset_id="<asset_id from 2.1>"
  ResourceUpdateRequest={
    "tags": "sanity-test,updated",
    "context": "caption=Sanity test image|alt=A sample image"
  }
```

Expect: Updated asset details reflecting new tags and context.

### 5.2 asset-rename

```
asset-rename
  resource_type="image"
  RequestBody={
    "from_public_id": "sanity-test-upload",
    "to_public_id": "sanity-test-renamed"
  }
```

Expect: Asset details with `public_id: "sanity-test-renamed"`.

### 5.3 create-asset-relations

Upload a second image first, then:

```
create-asset-relations
  asset_id="<asset_id from 2.1>"
  RequestBody={"assets_to_relate": ["<asset_id from 2.2>"]}
```

Expect: Success response. Verify bidirectional relation via get-asset-details.

### 5.4 move-folder

```
move-folder
  folder="sanity-test-folder"
  RequestBody={"to_folder": "sanity-test-folder-moved"}
```

Expect: Folder renamed successfully.

### 5.5 generate-archive

```
generate-archive
  resource_type="image"
  RequestBody={
    "public_ids": ["sanity-test-renamed", "sanity-test-local-upload"],
    "target_public_id": "sanity-test-archive",
    "target_format": "zip"
  }
```

Expect: Archive created with `secure_url` pointing to downloadable ZIP.

---

## Phase 6: Cleanup (destructive)

Run these in order to remove all test artifacts.

### 6.1 delete-asset-relations

```
delete-asset-relations
  asset_id="<asset_id from 2.1>"
  RequestBody={"assets_to_unrelate": ["<asset_id from 2.2>"]}
```

### 6.2 delete-derived-assets

Get derived resource IDs from get-asset-details, then:

```
delete-derived-assets
  request={"derived_resource_ids": ["<id1>", "<id2>", ...]}
```

### 6.3 delete-asset (both test images)

```
delete-asset  request={"asset_id": "<asset_id from 2.1>"}
delete-asset  request={"asset_id": "<asset_id from 2.2>"}
```

### 6.4 delete-folder

```
delete-folder  folder="sanity-test-folder-moved"
```

### 6.5 Final verification

```
search-assets  expression="tags:sanity-test"  max_results=10
```

Expect: `total_count: 0` — all test assets cleaned up.

---

## Tools not covered above

| Tool | Reason | How to test |
|------|--------|-------------|
| **download-asset-backup** | Requires backup to be enabled and a valid `version_id` | Enable backups, upload an asset, get `version_id` from `get-asset-details` with `versions=true`, then call with `asset_id` + `version_id` |

---

## Checklist

- [ ] All read-only tools return valid responses
- [ ] `_headers` present in all JSON responses (when `CLOUDINARY_COLLECT_HEADERS` is set)
- [ ] Upload works with both remote URL and local `file://` path
- [ ] `transform-asset` returns full `eager` array (not empty `{}`)
- [ ] `get-tx-reference` returns transformation rules markdown
- [ ] All mutating operations succeed with basic auth (no signature errors)
- [ ] Cleanup removes all test artifacts
- [ ] Server handles cancellation gracefully (disconnect mid-request)
