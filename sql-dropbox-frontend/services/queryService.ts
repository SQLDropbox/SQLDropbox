import { api } from "./apiClient";

const executeQuery = async ({schema, query}: {schema: string; query: string;}) => {
    const params = new URLSearchParams({
        sourceSchema: schema,
        selectQuery: query,
    });

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/Schema/clone-and-query-dynamic?${params.toString()}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        },
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to execute query");
    }

    const contentType = response.headers.get("content-type");

    if (contentType?.includes("text/csv")) {
        return {
            type: "csv",
            data: await response.text(),
        };
    }

    return {
        type: "json",
        data: await response.json(),
    };
};

export const queryService = {
    executeQuery,
};