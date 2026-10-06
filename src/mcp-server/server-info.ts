/*
 * Server metadata and instructions returned in the MCP initialize response.
 */

import type { Implementation } from "@modelcontextprotocol/sdk/types.js";
import { isRemoteMCP } from "../hooks/runtimeMode.js";

const ICON_BASE =
  "https://cloudinary-res.cloudinary.com/image/upload/docsite/brand-assets";

export const serverInfo: Omit<Implementation, "name" | "version"> = {
  title: "Cloudinary Asset Management",
  description:
    "Upload, generate, organize, search, and transform images, videos, and files with AI-powered tools.",
  websiteUrl: "https://cloudinary.com/documentation/cloudinary_llm_mcp",
  icons: [32, 96, 192].map((size) => ({
    src: `${ICON_BASE}/cloudinary_favicon_${size}x${size}.png`,
    mimeType: "image/png",
    sizes: [`${size}x${size}`],
  })),
};

// Local-file guidance differs: the hosted server has no filesystem access and offers sign-upload instead.
const uploadGuidance = "- Uploading: upload-asset accepts an HTTPS URL, a private S3 or Google Storage bucket URL, or an FTP address. "
  + (isRemoteMCP()
    ? "For a file on the user's machine, use sign-upload and POST the file directly to the Upload API. Paths inside the assistant's own sandbox are not reachable."
    : "For a local file, pass its path as file:///absolute/path.");

export const instructions =
  `Cloudinary Asset Management: store, find, edit, transform and generate images and videos in the user's Cloudinary account.

- Creating images: when the user wants a new image or a variation of an existing one, use generate-image (from a text prompt) or generate-image-from-images (a prompt plus up to 4 reference images by URL or asset_id). The result is saved directly to the account, ready to deliver and transform, with no separate upload step. Use model.mode "auto" unless the user names a model.
${uploadGuidance}
- Finding: search-assets is the main entry point (tags, folder, format, metadata, dates) and returns the asset_id and public_id other tools need. visual-search-assets finds images by a text description or a similar image. list-images, list-videos and list-files are for plain listing.
- Identifiers: get-asset-details, asset-update and delete-asset take asset_id; manage-asset-tags, asset-rename and transform-asset take public_id.
- Transforming: transform-asset creates derived versions (resize, crop, format, effects). Call get-tx-reference once per session first for valid syntax.
- Overwrites: upload-asset replaces an existing public_id by default, and delete-asset is permanent. Confirm with the user first.
- Docs: https://cloudinary.com/documentation/llms.txt indexes all Cloudinary docs; append .md to a documentation URL for Markdown.`;
