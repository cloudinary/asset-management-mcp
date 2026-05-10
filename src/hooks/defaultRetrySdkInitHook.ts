import { SDKOptions } from "../lib/config.js";
import { SDKInitHook } from "./types.js";

/**
 * When the caller does not set {@link SDKOptions.retryConfig}, use bounded
 * exponential backoff so transient Admin API rate limits (429) and 5xx are
 * retried. Applies to all SDK operations that list retryable status codes.
 */
export class DefaultRetrySdkInitHook implements SDKInitHook {
  sdkInit(opts: SDKOptions): SDKOptions {
    if (opts.retryConfig !== undefined) {
      return opts;
    }
    return {
      ...opts,
      retryConfig: {
        strategy: "backoff",
        backoff: {
          initialInterval: 1000,
          maxInterval: 30000,
          exponent: 2,
          maxElapsedTime: 120000,
        },
      },
    };
  }
}
