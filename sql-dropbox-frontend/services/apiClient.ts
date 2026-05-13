const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function publicFetch(
    url: string,
    options: RequestInit = {},
): Promise<any> {
    if (!API_URL) {
        const errorMessage =
            "NEXT_PUBLIC_API_URL is not defined in environment variables.";
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");

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
};
