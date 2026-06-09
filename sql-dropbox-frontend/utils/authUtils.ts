import { authService } from "@/services/authService";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const setup = async (
    router: AppRouterInstance,
    studentId: string,
    password: string,
) => {
    await authService.setupAccount(studentId, password);

    setTimeout(() => {
        router.push("/");
    }, 50);
};

const login = async (
    router: AppRouterInstance,
    emailOrCode: string,
    password: string,
) => {
    //const response =
    await authService.login(emailOrCode, password);

    //setJWTCookie(response.token);

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
    const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;
    const secureFlag = environment == "dev" ? "" : "; Secure";

    try {
        if (!token) {
            document.cookie = `token=; path=/; max-age=0; SameSite=Strict${secureFlag}`;
            return;
        }

        document.cookie = `token=${token}; path=/; SameSite=Strict${secureFlag}`;
    } catch (err) {
        console.error("Invalid token:", err);
    }
};

export const authUtils = {
    setup,
    login,
    logout,
    setJWTCookie,
};
