import { CollectHeaders } from "./cloudConfig.js";
import { AfterSuccessContext, AfterSuccessHook } from "./types.js";

/**
 * Captures response headers and injects them into the JSON body as `_headers`
 * so they survive through the generated formatResult() and surface in MCP tool
 * output. The set of headers to collect is driven by configuration:
 *   - `true`      → collect every response header
 *   - `string[]`  → collect only the listed header names
 */
export class ResponseHeadersHook implements AfterSuccessHook {
  private readonly collectHeaders: CollectHeaders;

  constructor(collectHeaders: CollectHeaders) {
    this.collectHeaders = collectHeaders;
  }

  async afterSuccess(
    _hookCtx: AfterSuccessContext,
    response: Response,
  ): Promise<Response> {
    // Not configured — exit early
    if (this.collectHeaders !== true && this.collectHeaders.length === 0) {
      return response;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("json")) {
      return response;
    }

    const hdrs: Record<string, string> = {};
    let found = false;

    if (this.collectHeaders === true) {
      // Collect all response headers
      for (const [name, value] of response.headers.entries()) {
        hdrs[name] = value;
        found = true;
      }
    } else {
      // Collect only the specified headers
      for (const name of this.collectHeaders) {
        const val = response.headers.get(name);
        if (val) {
          hdrs[name] = val;
          found = true;
        }
      }
    }

    if (!found) {
      return response;
    }

    // Read body, inject headers, return a new Response so the stream is fresh.
    const body = await response.json();
    body._headers = hdrs;

    return new Response(JSON.stringify(body), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }
}
