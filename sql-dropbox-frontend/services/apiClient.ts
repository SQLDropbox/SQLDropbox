import { setJWTCookie } from "@/utils/authUtils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type FetchType = "json" | "file";

let refreshPromise: Promise<string> | null = null;

function getTokenFromCookie(): string | undefined {
    return document.cookie.match(/(?:^|;\s*)token=([^;]*)/)?.[1];
}

async function parseResponse(response: Response) {
    const text = await response.text();
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

async function publicFetch(
    url: string,
    options: RequestInit = {},
    type: FetchType = "json",
) {
    if (!API_URL) throw new Error("API_URL is not defined");

    const headers = new Headers(options.headers);

    if (type === "json" && !(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(API_URL + url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return parseResponse(response);
}

async function refreshAccessToken(): Promise<string> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        const refresh = await publicFetch(
            "/Auth/refresh",
            {
                method: "GET",
                credentials: "include",
            },
        );

        if (!refresh?.token) {
            throw new Error("No refresh token returned");
        }

        setJWTCookie(refresh.token);
        return refresh.token;
    })();

    try {
        return await refreshPromise;
    } finally {
        refreshPromise = null;
    }
}

async function privateFetch(
    url: string,
    options: RequestInit = {},
    type: FetchType = "json",
) {
    if (!API_URL) throw new Error("API_URL is not defined");

    let token = getTokenFromCookie();

    const headers = new Headers(options.headers);

    const attachHeaders = (t: string) => {
        if (type === "json" && !(options.body instanceof FormData)) {
            headers.set("Content-Type", "application/json");
        }
        headers.set("Authorization", `Bearer ${t}`);
    };

    const request = async (t: string) =>
        fetch(API_URL + url, {
            ...options,
            headers,
            credentials: "include",
        });

    // -------------------------
    // initial request
    // -------------------------
    if (token) attachHeaders(token);

    let response = await request(token ?? "");

    // -------------------------
    // refresh on 401
    // -------------------------
    if (response.status === 401) {
        try {
            token = await refreshAccessToken();
            attachHeaders(token);

            response = await request(token);
        } catch {
            setJWTCookie(null);
            window.location.href = "/login";
            throw new Error("Session expired");
        }
    }

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return parseResponse(response);
}

export const api = {
    publicFetch,
    privateFetch,
};