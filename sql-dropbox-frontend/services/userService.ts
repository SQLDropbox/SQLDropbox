import { User } from "@/types/types";
import { api } from "./apiClient";

interface StudentDTO {
    userCode: string;
    firstName: string;
    lastName: string;
    email: string;
}

const addStudent = async (courseId: string, dto: StudentDTO) => {
    return api.privateFetch(`/User/studentCourse/${courseId}`, {
        method: "POST",
        body: JSON.stringify(dto),
    });
};

const previewImportStudents = async (courseId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.privateFetch(
        `/User/studentCourse/${courseId}/import/preview`,
        {
            method: "POST",
            body: formData,
        },
        "file",
    );
};

const importStudents = async (courseId: string, students: User[]) => {
    return api.privateFetch(
        `/User/studentCourse/${courseId}/import`,
        {
            method: "POST",
            body: JSON.stringify(students),
        },
    );
};

const getStudents = async (courseId: string) => {
    return api.privateFetch(`/User/students/${courseId}`, {
        method: "GET",
    });
};
const getAllLecturers = async () => {
    return api.privateFetch("/User/lecturers", {
        method: "GET",
    });
};

export const userService = {
    addStudent,
    previewImportStudents,
    importStudents,
    getStudents,
    getAllLecturers,
};
