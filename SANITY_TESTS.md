# MCP Server Sanity Tests

Manual test plan for the MCP tools. Tests are grouped into phases that build on each other — run them in order so that assets created in earlier steps are available for later ones.

## Prerequisites

Start the server with header collection enabled (uses exact names, `prefix:`, and `regex:` matching):

```bash
CLOUDINARY_COLLECT_HEADERS=x-request-id,prefix:x-featureratelimit- \
  node bin/mcp-server.js start --transport sse --log-level debug
```

Verify the `_headers` object appears in every response that returns JSON.

### Header matching specs

| Format | Example | Behaviour |
|--------|---------|-----------|
| exact  | `x-request-id` | matches only `x-request-id` |
| `prefix:<value>` | `prefix:x-featureratelimit-` | matches any header starting with `x-featureratelimit-` |
| `regex:<pattern>` | `regex:ratelimit` | matches any header whose name contains `ratelimit` |

---

## Phase 0: Hook verification (debug log inspection)

### 0.1 User-Agent string

Run any tool (e.g. `get-usage-details`) and inspect the server debug logs.

Expect the outgoing `User-Agent` header to match:

```
Cloudinary/AssetManagementMcp MCP/<sdkVersion> Gen/<genVersion> Schema/<openapiDocVersion> (Node.js <ver>; <platform> <arch>)
```

If the SDK was constructed with a caller User-Agent (e.g. by a remote MCP service), the string should also contain `; origin <callerUA>`.

### 0.2 Response header collection with prefix/regex

Call `get-usage-details` and inspect the `_headers` key in the response:

- `x-request-id` should appear (exact match)
- any `x-featureratelimit-*` headers should appear (prefix match)

---

## Phase 1: Read-only tools (no side effects)

### 1.1 get-usage-details

```sh
get-usage-details
```

Expect: Account usage stats (plan, credits, storage, bandwidth, resources count).

### 1.2 list-images

```ini
list-images  max_results=3  fields=["filename","format","bytes","width","height"]
```

Expect: Array of up to 3 image resources with requested fields.

### 1.3 list-videos

```sh
list-videos  max_results=3  fields=["filename","format","bytes"]
```

Expect: Array of video resources (may be empty if no videos exist).

### 1.4 list-files

```sh
list-files  max_results=3
```

Expect: Array of raw file resources (may be empty).

### 1.5 list-tags

```sh
list-tags  resource_type="image"  max_results=5
```

Expect: Array of tag strings.

### 1.6 search-assets

```ini
search-assets  request={"expression": "resource_type:image AND format:jpg", "max_results": 2}
```

Expect: `total_count`, `time`, and `resources` array with matching assets.

### 1.7 search-folders

```sh
search-folders  max_results=5
```

Expect: Array of folders with `name`, `path`, `created_at`.

### 1.8 get-tx-reference

```sh
get-tx-reference
```

Expect: Full markdown document with Cloudinary transformation rules. Verify it starts with `# Cloudinary Transformation Rules Documentation`.

---

## Phase 2: Upload and asset creation

### 2.1 upload-asset (remote URL)

```yaml
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

```yaml
upload-asset
  upload_request={
    "file": "file:///path/to/a/local/image.jpg",
    "public_id": "sanity-test-local-upload",
    "tags": "sanity-test"
  }
```

Expect: Successful upload. Verifies the `file://` to base64 conversion in the auth hook.

### 2.3 create-folder

```sh
create-folder  folder="sanity-test-folder"
```

Expect: Folder created successfully.

---

## Phase 3: Read details of created assets

### 3.1 get-asset-details

```sh
get-asset-details  asset_id="<asset_id from 2.1>"
```

Expect: Full asset details including `public_id`, `format`, `bytes`, `width`, `height`, `secure_url`.

### 3.2 search-assets (by tag)

```sh
search-assets  request={"expression": "tags:sanity-test", "max_results": 10}
```

Expect: Both uploaded assets from Phase 2 appear in results.

### 3.3 visual-search-assets

```html
visual-search-assets  request={"text": "landscape with mountains"}
```

Expect: Array of visually similar image results (may vary by account content).

---

## Phase 4: Transform

### 4.1 transform-asset (fill + auto format)

```sh
transform-asset
  publicId="sanity-test-upload"
  transformations="c_fill,g_auto,h_300,w_400/f_auto/q_auto"
```

Expect: Full response with `eager` array containing:

- `transformation` string
- `width: 400`, `height: 300`
- `bytes`, `format`, `secure_url`

### 4.2 transform-asset (effect + format conversion)

```md
transform-asset
  publicId="sanity-test-upload"
  transformations="e_sepia/c_scale,w_600/f_webp/q_80"
```

Expect: `eager` array with `format: "webp"`, `width: 600`.

### 4.3 transform-asset (circular thumbnail)

```sh
transform-asset
  publicId="sanity-test-upload"
  transformations="c_thumb,g_face,h_200,w_200/r_max/f_png"
```

Expect: `eager` array with `format: "png"`, `width: 200`, `height: 200`.

---

## Phase 5: Update and mutate

### 5.1 asset-update (add context and tags)

```yaml
asset-update
  asset_id="<asset_id from 2.1>"
  ResourceUpdateRequest={
    "tags": "sanity-test,updated",
    "context": "caption=Sanity test image|alt=A sample image"
  }
```

Expect: Updated asset details reflecting new tags and context.

### 5.2 manage-asset-tags (bulk add and remove)

```yaml
manage-asset-tags
  resource_type="image"
  tags_update_request={
    "public_ids": ["sanity-test-upload", "sanity-test-local-upload"],
    "command": "add",
    "tags": ["sanity-bulk"]
  }
search-assets  request={"expression": "tags:sanity-bulk", "max_results": 10}
manage-asset-tags
  resource_type="image"
  tags_update_request={
    "public_ids": ["sanity-test-upload", "sanity-test-local-upload"],
    "command": "remove",
    "tags": ["sanity-bulk"]
  }
```

Expect: Both commands succeed; the search finds both assets; after the remove, `get-asset-details` shows both still carry the `sanity-test` tag and not `sanity-bulk`.

### 5.3 manage-asset-context (bulk add and clear)

```yaml
manage-asset-context
  resource_type="image"
  context_update_request={
    "public_ids": ["sanity-test-upload", "sanity-test-local-upload"],
    "command": "add",
    "context": "source=sanity-test"
  }
manage-asset-context
  resource_type="image"
  context_update_request={
    "public_ids": ["sanity-test-local-upload"],
    "command": "remove_all"
  }
```

Expect: Both commands succeed; `get-asset-details` shows `source=sanity-test` on `sanity-test-upload` and no context on `sanity-test-local-upload`.

### 5.4 manage-asset-metadata (bulk set)

Requires an existing text structured metadata field. Get its `external_id` from the Console or the Admin API.

```yaml
manage-asset-metadata
  resource_type="image"
  metadata_update_request={
    "public_ids": ["sanity-test-upload", "sanity-test-local-upload"],
    "metadata": {"<external_id>": "sanity-test"}
  }
search-assets  request={"expression": "metadata.<external_id>:sanity-test", "max_results": 10}
```

Expect: The command succeeds; the search finds both assets.

### 5.5 asset-rename

```md
asset-rename
  resource_type="image"
  RequestBody={
    "from_public_id": "sanity-test-upload",
    "to_public_id": "sanity-test-renamed"
  }
```

Expect: Asset details with `public_id: "sanity-test-renamed"`.

### 5.6 create-asset-relations

Upload a second image first, then:

```rb
create-asset-relations
  asset_id="<asset_id from 2.1>"
  RequestBody={"assets_to_relate": ["<asset_id from 2.2>"]}
```

Expect: Success response. Verify bidirectional relation via get-asset-details.

### 5.7 move-folder

```yaml
move-folder
  folder="sanity-test-folder"
  RequestBody={"to_folder": "sanity-test-folder-moved"}
```

Expect: Folder renamed successfully.

### 5.8 generate-archive

```md
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

## Phase 6: Generation and collections

Image and video generation use credits. Video generation is in Public Beta.

### 6.1 generate-image

```yaml
generate-image
  request={
    "prompt": "A white sneaker on a pastel background, studio lighting",
    "image_size": {"aspect_ratio": "1:1"},
    "target": {"target_type": "managed_asset", "public_id": "sanity-test-generated"}
  }
```

Expect: An image with `asset_id`, URL, size, format, and model, or a `task_id` for a background task.
Save the `asset_id` for later tests.

### 6.2 get-generation-task

Only when 6.1 returned a `task_id`:

```sh
get-generation-task  task_id="<task_id from 6.1>"
```

Expect: Task status; when completed, the generated image details.

### 6.3 generate-image-from-images

```yaml
generate-image-from-images
  request={
    "prompt": "Replace the background of [1] with a city street at night",
    "reference_images": [{"source_type": "managed_asset", "asset_id": "<asset_id from 6.1>"}],
    "target": {"target_type": "temporary"}
  }
```

Expect: An edited image at a temporary URL; nothing is saved to the account.

### 6.4 generate-video-from-image

```yaml
generate-video-from-image
  request={
    "image_asset_id": "<asset_id from 6.1>",
    "prompt": "The camera slowly orbits the sneaker",
    "duration": 4,
    "folder": "sanity-test-folder-moved"
  }
```

Expect: A job with its ID and status.

### 6.5 get-video-generation-job

Poll until the status is `completed`:

```sh
get-video-generation-job  jobId="<job id from 6.4>"
```

Expect: When `completed`, the generated video's asset details and delivery URL. Save its `asset_id`.

### 6.6 create-collection

```yaml
create-collection  request={"name": "sanity-test-collection"}
```

Expect: The new collection with its `id`. Save it as `collection_id`.

### 6.7 add-collection-assets / list-collection-assets

```yaml
add-collection-assets
  collection_id="<collection_id>"
  RequestBody=["<asset_id from 2.1>", "<asset_id from 6.1>"]
list-collection-assets  collection_id="<collection_id>"
```

Expect: Both assets listed in the collection.

### 6.8 list-collections / get-collection / update-collection

```yaml
list-collections  query="sanity-test"
get-collection  collection_id="<collection_id>"
update-collection
  collection_id="<collection_id>"
  contractUpdateCollectionRequestPayload={"name": "sanity-test-collection-renamed"}
```

Expect: The collection appears in the list, its details are returned, and the rename succeeds.

### 6.9 publish-collection

```yaml
publish-collection
  collection_id="<collection_id>"
  contractCreatePublicPageRequestPayload={"name": "sanity-test-page"}
```

Expect: A public page with its `id` and `url`. Save the `id` as `public_page_id`.

### 6.10 Public page reads and update

```yaml
list-collection-public-pages  collection_id="<collection_id>"
get-collection-public-page  collection_id="<collection_id>"  public_page_id="<public_page_id>"
update-collection-public-page
  collection_id="<collection_id>"
  public_page_id="<public_page_id>"
  contractUpdatePublicPageRequestPayload={"name": "sanity-test-page-renamed"}
```

Expect: The page is listed, its details are returned, and the rename succeeds.

---

## Phase 7: Cleanup (destructive)

Run these in order to remove all test artifacts.

### 7.1 Collection cleanup

```yaml
unpublish-collection-public-page  collection_id="<collection_id>"  public_page_id="<public_page_id>"
remove-collection-assets  collection_id="<collection_id>"  RequestBody=["<asset_id from 2.1>", "<asset_id from 6.1>"]
delete-collection  collection_id="<collection_id>"
```

### 7.2 delete-asset-relations

```rb
delete-asset-relations
  asset_id="<asset_id from 2.1>"
  RequestBody={"assets_to_unrelate": ["<asset_id from 2.2>"]}
```

### 7.3 delete-derived-assets

Get derived resource IDs from get-asset-details, then:

```yaml
delete-derived-assets
  request={"derived_resource_ids": ["<id1>", "<id2>", ...]}
```

### 7.4 delete-asset (test images and generated assets)

```sql
delete-asset  request={"asset_id": "<asset_id from 2.1>"}
delete-asset  request={"asset_id": "<asset_id from 2.2>"}
delete-asset  request={"asset_id": "<asset_id from 6.1>"}
delete-asset  request={"asset_id": "<video asset_id from 6.5>"}
```

### 7.5 delete-folder

```ini
delete-folder  folder="sanity-test-folder-moved"
```

### 7.6 Final verification

```sh
search-assets  request={"expression": "tags:sanity-test", "max_results": 10}
```

Expect: `total_count: 0` — all test assets cleaned up.

---

## Tools not covered above

| Tool | Reason | How to test |
|------|--------|-------------|
| __download-asset-backup__ | Requires backup to be enabled and a valid `version_id` | Enable backups, upload an asset, get `version_id` from `get-asset-details` with `versions=true`, then call with `asset_id` + `version_id` |

---

## Checklist

- [ ] All read-only tools return valid responses
- [ ] `_headers` present in all JSON responses (when `CLOUDINARY_COLLECT_HEADERS` is set)
- [ ] `_headers` correctly filters by exact name, `prefix:`, and `regex:` specs
- [ ] User-Agent string follows expected format (check debug logs)
- [ ] Caller User-Agent appears as `; origin <callerUA>` when SDK is constructed with one
- [ ] Upload works with both remote URL and local `file://` path
- [ ] `transform-asset` returns full `eager` array (not empty `{}`)
- [ ] `get-tx-reference` returns transformation rules markdown
- [ ] All mutating operations succeed with basic auth (no signature errors)
- [ ] Bulk tag, context, and metadata updates apply to every listed public ID
- [ ] Image generation saves to the account (6.1) and to a temporary URL (6.3)
- [ ] Video generation job completes and returns a delivery URL
- [ ] Collection create, add, list, update, publish, and unpublish all succeed
- [ ] Cleanup removes all test artifacts
- [ ] Server handles cancellation gracefully (disconnect mid-request)
