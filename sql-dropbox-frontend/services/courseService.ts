import { api } from "./apiClient";

const getCourses = async () => {
    return api.publicFetch("/Course", {
        method: "GET",
    });
};

export const courseService = {
    getCourses,
};