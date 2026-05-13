import { Course } from "@/types/types";
import { api } from "./apiClient";

const getCourses = async () => {
    return api.publicFetch("/Course", {
        method: "GET",
    });
};

const addCourse = async (course: Course) => {
    return api.publicFetch("/Course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(course),
    });
};

export const courseService = {
    getCourses,
    addCourse,
};
