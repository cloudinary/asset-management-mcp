/*
 * Custom MCP server extensions
 */

import { z } from "zod";
import { Register } from "./extensions.js";
import { formatResult } from "./tools.js";
import { assetsExplicitAsset } from "../funcs/assetsExplicitAsset.js";
import { ResourceType$zodSchema } from "../models/resourcetype.js";
import {
  ASSET_GALLERY_RESOURCE_URI,
  MCP_APP_MIME_TYPE,
  getAssetGalleryHtml,
} from "./asset-gallery-widget.js";
import {
  ASSET_DETAILS_RESOURCE_URI,
  getAssetDetailsHtml,
} from "./asset-details-widget.js";
import {
  ASSET_UPLOAD_RESOURCE_URI,
  getAssetUploadHtml,
} from "./asset-upload-widget.js";

const TX_RULES_URL = "https://cloudinary.com/documentation/cloudinary_transformation_rules.md";

export function registerMCPExtensions(register: Register): void {
  // Get transformation reference tool
  register.tool({
    name: "get-tx-reference",
    description: "Get Cloudinary transformation rules documentation from official docs\n\n🚨 WHEN TO USE:\n- MANDATORY before creating, modifying, or discussing Cloudinary transformations\n- REQUIRED when user asks for image/video effects, resizing, cropping, filters, etc.\n- NOT needed for simple asset management (upload, list, delete, etc.)\n- ⚠️ CALL ONLY ONCE per session - documentation doesn't change, reuse the knowledge\n\n🚨 STRICT REQUIREMENTS (when transformations are involved):\n- MUST call this tool BEFORE any transformation-related task (but only once)\n- MUST read and understand the returned documentation\n- DO NOT attempt transformations without consulting this reference\n- DO NOT make up transformation parameters\n- DO NOT guess syntax - only use documented parameters\n- DO NOT call this tool multiple times - the docs are static, remember them\n\nThis tool returns the complete, authoritative Cloudinary transformation reference that contains all valid parameters, syntax rules, and best practices.",
    scopes: ["librarian", "builder"],
    annotations: {
      title: "Get Cloudinary Transformation Reference",
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
      readOnlyHint: true,
    },
    tool: async (_client, ctx) => {
      try {
        const response = await fetch(TX_RULES_URL, { signal: ctx.signal });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const content = await response.text();

        return {
          content: [
            {
              type: "text",
              text: `# Cloudinary Transformation Rules Documentation\n\n${content}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching transformation rules documentation: ${error instanceof Error ? error.message : 'Unknown error'}\n\nYou can view the documentation directly at: ${TX_RULES_URL}`
            }
          ],
          isError: true
        };
      }
    }
  });

  // Asset gallery MCP App — interactive UI for list-images results
  register.resource({
    name: "Asset Gallery Widget",
    description: "Interactive asset gallery for browsing Cloudinary images",
    metadata: {
      mimeType: MCP_APP_MIME_TYPE,
    },
    resource: ASSET_GALLERY_RESOURCE_URI,
    scopes: [],
    read: async (_client, _uri, _extra) => ({
      contents: [{
        uri: ASSET_GALLERY_RESOURCE_URI,
        mimeType: MCP_APP_MIME_TYPE,
        text: getAssetGalleryHtml(),
        _meta: {
          ui: {
            csp: {
              resourceDomains: [
                "https://res.cloudinary.com",
                "https://*.cloudinary.com",
              ],
            },
          },
        },
      } as any],
    }),
  });

  // Asset details MCP App — interactive UI for get-asset-details results
  register.resource({
    name: "Asset Details Widget",
    description: "Interactive single-asset detail view for Cloudinary assets",
    metadata: {
      mimeType: MCP_APP_MIME_TYPE,
    },
    resource: ASSET_DETAILS_RESOURCE_URI,
    scopes: [],
    read: async (_client, _uri, _extra) => ({
      contents: [{
        uri: ASSET_DETAILS_RESOURCE_URI,
        mimeType: MCP_APP_MIME_TYPE,
        text: getAssetDetailsHtml(),
        _meta: {
          ui: {
            csp: {
              resourceDomains: [
                "https://res.cloudinary.com",
                "https://*.cloudinary.com",
              ],
            },
          },
        },
      } as any],
    }),
  });

  // Asset upload MCP App — interactive upload UI for upload-asset tool
  register.resource({
    name: "Asset Upload Widget",
    description: "Interactive upload interface for uploading assets to Cloudinary",
    metadata: {
      mimeType: MCP_APP_MIME_TYPE,
    },
    resource: ASSET_UPLOAD_RESOURCE_URI,
    scopes: [],
    read: async (_client, _uri, _extra) => ({
      contents: [{
        uri: ASSET_UPLOAD_RESOURCE_URI,
        mimeType: MCP_APP_MIME_TYPE,
        text: getAssetUploadHtml(),
        _meta: {
          ui: {
            csp: {
              resourceDomains: [
                "https://res.cloudinary.com",
                "https://*.cloudinary.com",
              ],
            },
          },
        },
      } as any],
    }),
  });

  // Transform asset tool using explicit API with eager transformations
  register.tool({
    name: "transform-asset",
    description: "Generate derived transformations for existing assets using Cloudinary's explicit API with eager transformations\n\n⚠️ CRITICAL PREREQUISITES:\n1. MUST call get-tx-reference tool first\n2. MUST validate transformation syntax against official docs\n3. MUST use only documented parameters from the reference\n4. MUST follow proper URL component structure (slashes between components, commas within)\n\n📋 VALIDATION CHECKLIST:\n- ✅ Called get-tx-reference tool\n- ✅ Verified all parameters exist in official docs\n- ✅ Used correct syntax (e.g., f_auto/q_auto not f_auto,q_auto)\n- ✅ Applied proper component chaining rules\n- ✅ Included crop mode when using width/height\n\nThis tool creates actual derived assets on Cloudinary using the explicit API.",
    scopes: ["librarian", "builder"],
    args: {
      publicId: z.string().describe("The public ID of the existing asset to transform"),
      transformations: z.string().describe("VALIDATED transformation string using ONLY parameters from get-tx-reference docs. Examples: 'c_fill,w_300,h_200' or 'e_sepia/a_90'. MUST follow component rules: commas within components, slashes between components."),
      resourceType: ResourceType$zodSchema.optional().default("image").describe("The resource type of the asset"),
      invalidate: z.boolean().optional().default(false).describe("Whether to invalidate cached versions"),
    },
    annotations: {
      title: "Transform Cloudinary Asset",
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
      readOnlyHint: false,
    },
    tool: async (client, args, ctx) => {
      try {
        const [result] = await assetsExplicitAsset(client, args.resourceType, {
          public_id: args.publicId,
          type: "upload",
          eager: args.transformations,
          invalidate: args.invalidate,
        }, { fetchOptions: { signal: ctx.signal } }).$inspect();

        if (!result.ok) {
          return {
            content: [{ type: "text", text: result.error.message }],
            isError: true,
          };
        }

        return formatResult(result.value);
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error transforming asset: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    }
  });
}

