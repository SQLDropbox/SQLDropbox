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

const importStudents = async (courseId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.privateFetch(
        `/User/studentCourse/${courseId}/import`,
        {
            method: "POST",
            body: formData,
        },
        "file",
    );
};

export const userService = {
    addStudent,
    importStudents,
};
