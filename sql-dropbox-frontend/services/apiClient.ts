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
    headers.set("Authorization", `Bearer ${decodeURIComponent(token)}`);

    const response = await fetch(API_URL + url, { ...options, headers });

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
