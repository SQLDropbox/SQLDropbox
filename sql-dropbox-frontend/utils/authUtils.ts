import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const login = (router: AppRouterInstance, token: string) => {
    document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 14}; SameSite=Strict`;
    router.push("/");
}

const logout = (router: AppRouterInstance) => {
    document.cookie = "token=; path=/; max-age=0; SameSite=Strict";
    router.push("/login");
};

export const authUtils = {
    login,
    logout,
};
