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

export const userService = {
    addStudent,
};