import { authService } from "./authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type FetchType = "json" | "file";

async function publicFetch(
    url: string,
    options: RequestInit = {},
    type: FetchType = "json",
): Promise<any> {
    if (!API_URL) {
        const errorMessage =
            "NEXT_PUBLIC_API_URL is not defined in environment variables.";
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const headers = new Headers(options.headers);

    if (type === "json") {
        headers.set("Content-Type", "application/json");
    }
    headers.set("Content-Type", "application/json");

    const response = await fetch(API_URL + url, { ...options, headers });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Something went wrong.");
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

async function privateFetch(
    url: string,
    options: RequestInit = {},
    type: FetchType = "json",
    retry = true,
): Promise<any> {
    if (!API_URL) {
        const errorMessage =
            "NEXT_PUBLIC_API_URL is not defined in environment variables.";
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const token = document.cookie.match(/(?:^|;\s*)token=([^;]*)/)?.[1];

    if (!token) throw new Error("No token found, please log in.");

    const headers = new Headers(options.headers);

    if (type === "json") {
        headers.set("Content-Type", "application/json");
    }
    headers.set("Authorization", `Bearer ${token}`);

    let response = await fetch(API_URL + url, { ...options, headers });

    // =========================
    // TOKEN EXPIRED → REFRESH
    // =========================
    if (response.status === 401 && retry) {
        try {
            const refresh = await api.publicFetch(`/Auth/refresh`, {
                method: "GET",
                credentials: "include",
            });
            document.cookie = `token=${refresh.token}; path=/; max-age=${10}; SameSite=Strict`;
            headers.set("Authorization", `Bearer ${refresh.token}`);

            response = await fetch(API_URL + url, {
                ...options,
                headers,
                credentials: "include",
            });
        } catch {
            window.location.href = "/login";
            throw new Error("Session expired.");
        }
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Something went wrong.");
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

export const api = {
    publicFetch,
    privateFetch,
};
