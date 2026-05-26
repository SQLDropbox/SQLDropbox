import { authService } from "@/services/authService";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const login = async (router: AppRouterInstance, emailOrCode: string, password: string) => {
    const response = await authService.login(emailOrCode, password);

    document.cookie = `token=${response.token}; path=/; max-age=${10}; SameSite=Strict`;

    setTimeout(() => {
        router.push("/");
    }, 50);
};

const logout = async (router: AppRouterInstance) => {
    try {
        await authService.logout();
        document.cookie = "token=; path=/; max-age=0; SameSite=Strict";

        setTimeout(() => {
            router.push("/login");
        }, 50);
    } catch (err) {
        console.error("Error logging out:", err);
    }
};

export const authUtils = {
    login,
    logout,
};
