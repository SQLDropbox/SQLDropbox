import { api } from "./apiClient";

const setupPassword = async (guid: string) => {
    return api.publicFetch(`/Chapter/${guid}`, {
        method: "GET",
    });
};

export const authService = {
    setupPassword,
};
