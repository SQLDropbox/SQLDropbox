import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function logout(router: AppRouterInstance) {
    document.cookie = "token=; path=/; max-age=0; SameSite=Strict";
    router.push("/login");
}
