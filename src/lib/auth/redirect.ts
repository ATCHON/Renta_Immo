/** Allowed redirect path prefixes (Audit 1.6) */
const ALLOWED_PREFIXES = ["/", "/calculateur", "/simulations", "/auth"];

export function getValidatedRedirect(path: string | null): string {
    if (!path) {
        return "/";
    }

    // Block protocol-relative URLs (//evil.com) and non-root-relative paths
    if (!path.startsWith("/") || path.startsWith("//")) {
        return "/";
    }

    // Block backslashes (Windows path traversal)
    if (path.includes("\\")) {
        return "/";
    }

    // Normalize: decode percent-encoded characters then resolve path segments
    let decoded: string;
    try {
        decoded = decodeURIComponent(path);
    } catch {
        return "/";
    }

    // Block path traversal after decoding
    if (decoded.includes("..") || decoded.includes("\\")) {
        return "/";
    }

    // Validate decoded path against allowed prefixes
    const isAllowed = ALLOWED_PREFIXES.some(
        prefix => decoded === prefix || decoded.startsWith(prefix + "/") || decoded.startsWith(prefix + "?")
    );

    return isAllowed ? path : "/";
}
