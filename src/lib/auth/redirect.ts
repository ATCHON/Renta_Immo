/** Allowed redirect path prefixes (Audit 1.6) */
const ALLOWED_PREFIXES = ["/", "/calculateur", "/simulations", "/auth"];

export function getValidatedRedirect(path: string | null): string {
    if (!path) {
        return "/";
    }

    // Block protocol-relative URLs (//evil.com)
    if (path.startsWith("//")) {
        return "/";
    }

    // Must start with /
    if (!path.startsWith("/")) {
        return "/";
    }

    // Block path traversal (/../..)
    if (path.includes("..")) {
        return "/";
    }

    // Block encoded characters that could bypass checks
    if (path.includes("%2e") || path.includes("%2E") || path.includes("%2f") || path.includes("%2F")) {
        return "/";
    }

    // Block backslashes (Windows path traversal)
    if (path.includes("\\")) {
        return "/";
    }

    // Verify path matches allowed prefixes
    const isAllowed = ALLOWED_PREFIXES.some(
        prefix => path === prefix || path.startsWith(prefix + "/") || path.startsWith(prefix + "?")
    );

    return isAllowed ? path : "/";
}
