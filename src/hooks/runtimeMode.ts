/**
 * Runtime mode detection shared across hooks.
 */

/**
 * Whether this process is serving as a remote/hosted MCP server rather than a
 * local (stdio) one.
 *
 * Note: this is used to gate local filesystem access, not only telemetry.
 * Absence of the environment variable is treated as "local", so keep it set in
 * hosted deployments and update every caller if it is ever renamed.
 */
export function isRemoteMCP(): boolean {
    const process = (globalThis as any)?.process;
    return process?.env?.["OAUTH_WRAPPER_ORIGIN"] !== undefined;
}
