import { NextRequest, NextResponse } from "next/server";
import { decodeJwt } from "jose";

const ROLE_CLAIM =
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

const PUBLIC_ROUTES = ["/login", "/activate", "/unauthorized"];

const ROLE_ROUTES: Record<string, string[]> = {
    "/admin": ["Admin", "Lecturer", "Test"],
};

export function proxy(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const path = req.nextUrl.pathname;

    const isPublic = PUBLIC_ROUTES.some((r) => path.startsWith(r));

    const isLoginRoute = path.startsWith("/login");
    if (token && isLoginRoute) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    if (isPublic) return NextResponse.next();

    if (!token) {
        console.log("no token, redirecting to login");
        return NextResponse.redirect(new URL("/login", req.url));
    }

    let role: string | undefined;

    try {
        const payload = decodeJwt(token);
        role = payload[ROLE_CLAIM] as string;
    } catch {
        console.log("invalid token, redirecting to login");
        return NextResponse.redirect(new URL("/login", req.url));
    }

    const requiredRoles = Object.entries(ROLE_ROUTES).find(([route]) =>
        path.startsWith(route),
    )?.[1];

    if (requiredRoles && role && !requiredRoles.includes(role)) {
        console.log(
            `user role ${role} not authorized for path ${path}, redirecting to unauthorized`,
        );
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next|favicon.ico).*)"],
};
