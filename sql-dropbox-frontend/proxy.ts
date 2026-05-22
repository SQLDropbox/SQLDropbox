import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, importSPKI } from "jose";

const ROLE_CLAIM =
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

const PUBLIC_AUTH_ROUTES = ["/login", "/activate"];

const ROLE_ROUTES: Record<string, string[]> = {
    "/admin": ["Admin", "Lecturer"],
};

async function verifyToken(token: string) {
    const publicKey = process.env.JWT_PUBLIC_KEY;

    if (!publicKey) {
        console.error(
            "JWT_PUBLIC_KEY is not defined in environment variables.",
        );
        throw new Error(
            "JWT_PUBLIC_KEY is not defined in environment variables.",
        );
    }

    const key = await importSPKI(publicKey, "RS256");

    return jwtVerify(token, key);
}

export async function proxy(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const path = req.nextUrl.pathname;

    const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.some((route) =>
        path.startsWith(route),
    );

    const requiredRoles = Object.entries(ROLE_ROUTES).find(([route]) =>
        path.startsWith(route),
    )?.[1];

    // =========================
    // 1. PUBLIC AUTH ROUTES
    // =========================
    if (isPublicAuthRoute) {
        if (!token) return NextResponse.next();

        try {
            await verifyToken(token);
            return NextResponse.redirect(new URL("/", req.url));
        } catch {
            return NextResponse.next();
        }
    }

    // =========================
    // 2. EVERYTHING ELSE REQUIRES AUTH
    // =========================
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    let role: string;

    try {
        const { payload } = await verifyToken(token);
        role = payload[ROLE_CLAIM] as string;
    } catch {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // =========================
    // 3. ROLE-BASED ROUTES
    // =========================
    if (requiredRoles && !requiredRoles.includes(role)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next|favicon.ico).*)"],
};
