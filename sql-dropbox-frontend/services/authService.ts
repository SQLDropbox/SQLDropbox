import { api } from "./apiClient";

const getAccountSetup = async (userId: string) => {
    return api.publicFetch(`/Auth/setup/${userId}`, {
        method: "GET",
    });
};

const setupAccount = async (guid: string, password: string) => {
    return api.publicFetch(`/Auth/setup`, {
        method: "POST",
        body: JSON.stringify({ guid, password }),
    });
};

const login = async (emailOrCode: string, password: string) => {
    return api.publicFetch(`/Auth/login`, {
        method: "POST",
        body: JSON.stringify({ emailOrCode, password }),
    });
};

export const authService = {
    getAccountSetup,
    setupAccount,
    login,
};
