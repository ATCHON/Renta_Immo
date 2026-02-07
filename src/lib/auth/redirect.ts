export function getValidatedRedirect(path: string | null): string {
    if (!path) {
        return "/";
    }

    // Ensure path starts with / and does not start with // (protocol relative)
    // This prevents External Redirects like //google.com or https://google.com
    if (path.startsWith("/") && !path.startsWith("//")) {
        return path;
    }

    return "/";
}
