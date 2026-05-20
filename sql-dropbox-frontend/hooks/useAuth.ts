// hooks/useAuth.ts
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
    id: string;
    role: string;
    exp: number;
}

function getTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
}

export function useAuth() {
    const [user, setUser] = useState<JwtPayload | null>(null);

    useEffect(() => {
        const token = getTokenFromCookie();
        if (!token) return;
        try {
            setUser(jwtDecode<JwtPayload>(token));
        } catch {
            setUser(null);
        }
    }, []);

    return {
        user,
        isAdmin: user?.role === "Admin",
        hasRole: (role: string) => user?.role === role,
    };
}
