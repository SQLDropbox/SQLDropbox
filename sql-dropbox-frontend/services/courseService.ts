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
        body: JSON.stringify(course),
    });
};

const updateCourse = async (courseId: number, course: Course) => {
    return api.publicFetch(`/Course/${courseId}`, {
        method: "PUT",
        body: JSON.stringify(course),
    });
};

export const courseService = {
    getCourses,
    addCourse,
    updateCourse,
};
