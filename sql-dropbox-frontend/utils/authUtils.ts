import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const login = (router: AppRouterInstance, token: string) => {
    document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 14}; SameSite=Strict`;

    setTimeout(() => {
        router.push("/");
    }, 50);
};

const logout = (router: AppRouterInstance) => {
    document.cookie = "token=; path=/; max-age=0; SameSite=Strict";

    setTimeout(() => {
        router.push("/login");
    }, 50);
};

export const authUtils = {
    login,
    logout,
};
