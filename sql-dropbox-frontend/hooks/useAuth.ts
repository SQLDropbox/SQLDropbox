// hooks/useAuth.ts
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

interface JwtPayload {
    id: string;
    code: string;
    firstName: string;
    lastName: string;
    [ROLE_CLAIM]: string;
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

    const role = user?.[ROLE_CLAIM];

    console.log(role)

    return {
        user,
        role,
        isAdmin: role === "Admin",
        isLecturer: role === "Lecturer",
        hasRole: (role: string) => role === role,
    };
}
