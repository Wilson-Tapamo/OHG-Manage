import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const publicRoutes = ["/", "/api/auth"];
const directorOnlyRoutes = ["/consultants", "/finance"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if it's a public route
    const isPublicRoute = publicRoutes.some(
        (route) => pathname === route || pathname.startsWith("/api/auth")
    );

    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Get session
    const session = await auth();

    // Redirect to login if not authenticated
    if (!session) {
        const loginUrl = new URL("/", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Check role-based access
    const isDirectorOnlyRoute = directorOnlyRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (isDirectorOnlyRoute && session.user.role !== "DIRECTOR") {
        return NextResponse.redirect(new URL("/dashboard-consultant", request.url));
    }

    // Redirect based on role for dashboard routes
    if (pathname === "/dashboard") {
        if (session.user.role === "DIRECTOR") {
            return NextResponse.redirect(new URL("/dashboard-director", request.url));
        } else {
            return NextResponse.redirect(
                new URL("/dashboard-consultant", request.url)
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
