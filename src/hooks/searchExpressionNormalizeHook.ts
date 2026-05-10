import { RequestInput } from "../lib/http.js";
import {
  BeforeCreateRequestContext,
  BeforeCreateRequestHook,
} from "./types.js";
import { normalizeSearchExpression } from "./normalizeSearchExpression.js";

/**
 * Rewrites `expression` on `searchAssets` before the request body is turned
 * into a `Request`, correcting common invalid syntax without touching quoted
 * literal values.
 */
export class SearchExpressionNormalizeHook implements BeforeCreateRequestHook {
  beforeCreateRequest(
    hookCtx: BeforeCreateRequestContext,
    input: RequestInput,
  ): RequestInput {
    if (hookCtx.operationID !== "searchAssets") {
      return input;
    }
    const body = input.options?.body;
    if (typeof body !== "string") {
      return input;
    }
    try {
      const parsed = JSON.parse(body) as Record<string, unknown>;
      if (typeof parsed["expression"] !== "string") {
        return input;
      }
      const expr = parsed["expression"];
      const normalized = normalizeSearchExpression(expr);
      if (normalized === expr) {
        return input;
      }
      return {
        ...input,
        options: {
          ...input.options,
          body: JSON.stringify({ ...parsed, expression: normalized }),
        },
      };
    } catch {
      return input;
    }
  }
}
