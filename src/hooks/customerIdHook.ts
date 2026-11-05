import { BeforeRequestContext, BeforeRequestHook } from "./types.js";

const CUSTOMER_ID_HEADER = "X-Cld-Customer-External-Id";
const ASSET_MANAGEMENT_V2_PREFIX = "/v2/asset_management/";

/**
 * Sets the customer external ID header on OAuth requests to the v2 asset
 * management service, taken from the token's `ext.customer_external_id` claim.
 */
export class CustomerIdHook implements BeforeRequestHook {
    beforeRequest(
        _hookCtx: BeforeRequestContext,
        request: Request,
    ): Request {
        if (request.headers.has(CUSTOMER_ID_HEADER)) {
            return request;
        }

        if (!new URL(request.url).pathname.startsWith(ASSET_MANAGEMENT_V2_PREFIX)) {
            return request;
        }

        const authHeader = request.headers.get("Authorization") ?? "";
        if (!authHeader.startsWith("Bearer ")) {
            return request;
        }

        const customerId = readCustomerId(authHeader.slice("Bearer ".length));
        if (customerId) {
            request.headers.set(CUSTOMER_ID_HEADER, customerId);
        }

        return request;
    }
}

// Reads ext.customer_external_id from an unverified JWT payload.
function readCustomerId(token: string): string | undefined {
    const payload = token.split(".")[1];
    if (!payload) {
        return undefined;
    }

    try {
        const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
        const value = claims?.ext?.customer_external_id;
        return typeof value === "string" && value.length > 0 ? value : undefined;
    } catch {
        return undefined;
    }
}
