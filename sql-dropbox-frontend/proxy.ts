import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, importSPKI } from "jose";

const ROLE_CLAIM =
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

const ROLE_ROUTES: Record<string, string[]> = {
    "/admin": ["Admin", "Lecturer"],
};

export async function proxy(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const path = req.nextUrl.pathname;

    const requiredRoles = Object.entries(ROLE_ROUTES).find(([route]) =>
        path.startsWith(route),
    )?.[1];

    if (!requiredRoles) return NextResponse.next();

    if (!token) return NextResponse.redirect(new URL("/login", req.url));

    try {
        const publicKey = await importSPKI(
            process.env.JWT_PUBLIC_KEY!,
            "RS256",
        );

        if (!publicKey) {
            console.error(
                "JWT_PUBLIC_KEY is not defined in environment variables.",
            );
            return NextResponse.redirect(new URL("/login", req.url));
        }

        const { payload } = await jwtVerify(token, publicKey);
        const role = payload[ROLE_CLAIM] as string;

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
