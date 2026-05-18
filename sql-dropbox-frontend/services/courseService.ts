import { Course } from "@/types/types";
import { api } from "./apiClient";

const getCourses = async () => {
    return api.publicFetch("/Course", {
        method: "GET",
    });
};

const getCourseByCourseId = async (courseId: string) => {
    return api.publicFetch(`/Course/${courseId}`, {
        method: "GET",
    });
};

const addCourse = async (course: Course) => {
    return api.publicFetch("/Course", {
        method: "POST",
        body: JSON.stringify(course),
    });
};

const updateCourse = async (courseId: string, course: Course) => {
    return api.publicFetch(`/Course/${courseId}`, {
        method: "PUT",
        body: JSON.stringify(course),
    });
};

const deleteCourse = async (courseId: string) => {
    return api.publicFetch(`/Course/${courseId}`, {
        method: "DELETE",
    });
};

export const courseService = {
    getCourses,
    getCourseByCourseId,
    addCourse,
    updateCourse,
    deleteCourse,
};
