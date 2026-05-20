// middleware.ts (root of project, next to package.json)
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ROLE_ROUTES: Record<string, string[]> = {
    "/admin": ["Admin", "Lecturer"],
};

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const path = req.nextUrl.pathname;

    const requiredRoles = Object.entries(ROLE_ROUTES).find(([route]) =>
        path.startsWith(route),
    )?.[1];

    if (!requiredRoles) return NextResponse.next();

    if (!token) return NextResponse.redirect(new URL("/login", req.url));

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        const role = payload.role as string;

        if (!requiredRoles.includes(role)) {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }

        return NextResponse.next();
    } catch {
        return NextResponse.redirect(new URL("/login", req.url));
    }
}

export const config = {
    matcher: ["/admin/:path*"],
};
