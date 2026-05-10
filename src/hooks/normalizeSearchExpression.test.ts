import { describe, expect, test } from "bun:test";
import type { SDKOptions } from "../lib/config.js";
import { normalizeSearchExpression } from "./normalizeSearchExpression.js";
import { SearchExpressionNormalizeHook } from "./searchExpressionNormalizeHook.js";
import type { BeforeCreateRequestContext } from "./types.js";

describe("normalizeSearchExpression", () => {
  test("collapses space after colon on field:value (metadata, tags, asset_folder)", () => {
    expect(normalizeSearchExpression("metadata.campaign: *")).toBe(
      "metadata.campaign:*",
    );
    expect(normalizeSearchExpression("tags: *ranger*")).toBe("tags:*ranger*");
    expect(normalizeSearchExpression("asset_folder: photos")).toBe(
      "asset_folder:photos",
    );
  });

  test("quotes bare ISO-8601 datetimes after date field operators", () => {
    expect(normalizeSearchExpression("created_at>2026-04-24T00:00:00Z")).toBe(
      'created_at>"2026-04-24T00:00:00Z"',
    );
    expect(
      normalizeSearchExpression("uploaded_at<=2026-01-01T12:30:00.000Z"),
    ).toBe('uploaded_at<="2026-01-01T12:30:00.000Z"');
  });

  test("leaves already-quoted ISO datetimes unchanged", () => {
    expect(
      normalizeSearchExpression('uploaded_at>"2026-01-01T00:00:00Z"'),
    ).toBe('uploaded_at>"2026-01-01T00:00:00Z"');
  });

  test("does not alter spaces inside quoted segments", () => {
    expect(normalizeSearchExpression('tags:"key: value"')).toBe(
      'tags:"key: value"',
    );
  });

  test("leaves relative date shorthands unchanged", () => {
    expect(normalizeSearchExpression("tags:shirt AND uploaded_at>1d")).toBe(
      "tags:shirt AND uploaded_at>1d",
    );
  });

  test("applies colon fix only outside quotes when expression mixes quoted and unquoted", () => {
    expect(
      normalizeSearchExpression('tags: shirt AND context.note:"a: b"'),
    ).toBe('tags:shirt AND context.note:"a: b"');
  });

  test("taken_at and updated_at participate in ISO quoting", () => {
    expect(normalizeSearchExpression("taken_at>2020-01-01T00:00:00")).toBe(
      'taken_at>"2020-01-01T00:00:00"',
    );
    expect(normalizeSearchExpression("updated_at>=2020-01-01T00:00:00Z")).toBe(
      'updated_at>="2020-01-01T00:00:00Z"',
    );
  });
});

describe("SearchExpressionNormalizeHook", () => {
  const hook = new SearchExpressionNormalizeHook();
  const baseCtx = {
    baseURL: "https://api.cloudinary.com",
    operationID: "searchAssets",
    oAuth2Scopes: null,
    retryConfig: { strategy: "none" as const },
    resolvedSecurity: null,
    options: {} as SDKOptions,
  } satisfies BeforeCreateRequestContext;

  test("rewrites expression in JSON body for searchAssets", () => {
    const input = {
      url: new URL("https://api.cloudinary.com/v1_1/x/resources/search"),
      options: {
        method: "POST",
        headers: new Headers(),
        body: JSON.stringify({ expression: "tags: shirt", max_results: 10 }),
      },
    };
    const out = hook.beforeCreateRequest(
      { ...baseCtx, operationID: "searchAssets" },
      input,
    );
    expect(JSON.parse(String(out.options?.body))).toEqual({
      expression: "tags:shirt",
      max_results: 10,
    });
  });

  test("no-op for other operation IDs", () => {
    const body = JSON.stringify({ expression: "tags: shirt" });
    const input = {
      url: new URL("https://example.com"),
      options: { method: "POST", body },
    };
    const out = hook.beforeCreateRequest(
      { ...baseCtx, operationID: "listAssets" },
      input,
    );
    expect(out.options?.body).toBe(body);
  });

  test("no-op when JSON parse fails", () => {
    const input = {
      url: new URL("https://api.cloudinary.com/v1_1/x/resources/search"),
      options: { method: "POST", body: "not-json" },
    };
    const out = hook.beforeCreateRequest(
      { ...baseCtx, operationID: "searchAssets" },
      input,
    );
    expect(out).toBe(input);
  });
});
