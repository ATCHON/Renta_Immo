import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
    // On utilise une vérification simple du cookie pour le middleware afin d'éviter
    // un appel API supplémentaire à chaque requête, ce qui est suffisant pour
    // la redirection côté client. La sécurité réelle est assurée par les API Routes.
    const sessionCookie = request.cookies.get("better-auth.session_token") ||
        request.cookies.get("__secure-better-auth.session_token");

    const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
    const isSimulationsPage = request.nextUrl.pathname.startsWith("/simulations");

    if (!sessionCookie && isSimulationsPage) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (sessionCookie && isAuthPage) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/simulations/:path*", "/auth/:path*"],
};
