import { Course } from "@/types/types";
import { api } from "./apiClient";

const getCourses = async () => {
    return api.privateFetch("/Course", {
        method: "GET",
    });
};

const getCourseByCourseId = async (courseId: string) => {
    return api.privateFetch(`/Course/${courseId}`, {
        method: "GET",
    });
};

const addCourse = async (course: Course) => {
    return api.privateFetch("/Course", {
        method: "POST",
        body: JSON.stringify(course),
    });
};

const updateCourse = async (courseId: string, course: Course) => {
    return api.privateFetch(`/Course/${courseId}`, {
        method: "PUT",
        body: JSON.stringify(course),
    });
};

const deleteCourse = async (courseId: string) => {
    return api.privateFetch(`/Course/${courseId}`, {
        method: "DELETE",
    });
};

const duplicateCourse = async (courseId: string, newCourseId?: string) => {
    const payload = newCourseId ? { newCourseId } : {};
    return api.privateFetch(`/Course/${courseId}/duplicate`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
};

const addLecturerToCourse = async (courseId: string, userId: string) => {
    return api.privateFetch(`/Course/${courseId}/lecturers`, {
        method: "POST",
        body: JSON.stringify({ userId }),
    });
};

const removeLecturerFromCourse = async (courseId: string, userId: string) => {
    return api.privateFetch(`/Course/${courseId}/lecturers/${userId}`, {
        method: "DELETE",
    });
};

export const courseService = {
    getCourses,
    getCourseByCourseId,
    addCourse,
    updateCourse,
    deleteCourse,
    duplicateCourse,
    addLecturerToCourse,
    removeLecturerFromCourse,
};