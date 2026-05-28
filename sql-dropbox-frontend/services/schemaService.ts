import { api } from "./apiClient";

const getSchemas = async () => {
    return api.privateFetch("/Schema", {
        method: "GET",
    });
};

export const schemaService = {
    getSchemas,
};