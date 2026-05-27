import { authService } from "@/services/authService";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const login = async (
    router: AppRouterInstance,
    emailOrCode: string,
    password: string,
) => {
    const response = await authService.login(emailOrCode, password);

    setJWTCookie(response.token);

    setTimeout(() => {
        router.push("/");
    }, 50);
};

const logout = async (router: AppRouterInstance) => {
    try {
        await authService.logout();
    } catch (err) {
        console.error("Error logging out:", err);
    }

    setJWTCookie(null);

    setTimeout(() => {
        router.push("/login");
    }, 50);
};

export const setJWTCookie = (token: string | null = null) => {
    try {
        if (!token) {
            document.cookie = "token=; path=/; max-age=0; SameSite=Strict";
            return;
        }

        const payload = JSON.parse(atob(token.split(".")[1]));

        const exp = payload.exp;

        if (!exp) {
            throw new Error("Token missing exp claim");
        }

        const maxAge = exp - Math.floor(Date.now() / 1000);

        document.cookie = `token=${token}; path=/; max-age=${maxAge}; SameSite=Strict`;
    } catch (err) {
        console.error("Invalid token:", err);
    }
};

export const authUtils = {
    login,
    logout,
    setJWTCookie,
};
