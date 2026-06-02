import { api } from "./apiClient";

const getSchemas = async () => {
    return api.privateFetch("/Schema", {
        method: "GET",
    });
};

const createSchema = async (schemaName: string, image: File | null) => {
    const formData = new FormData();

    formData.append("schemaName", schemaName);

    if (image) {
        formData.append("image", image);
    }

    return api.privateFetch("/Schema", {
        method: "POST",
        body: formData,
    });
};

export const schemaService = {
    getSchemas,
    createSchema,
};