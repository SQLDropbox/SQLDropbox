import { api } from "./apiClient";

const setupPassword = async (userId: string) => {
    return api.publicFetch(`/Auth/setup/${userId}`, {
        method: "GET",
    });
};

export const authService = {
    setupPassword,
};
