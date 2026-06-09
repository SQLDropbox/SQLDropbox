import { Exercise } from "@/types/types";
import { api } from "./apiClient";

const getExercisesByChapterId = async (chapterId: string) => {
    return api.privateFetch(`/Chapter/${chapterId}/exercises`, {
        method: "GET",
    });
};

const getAllExercisesByChapterId = async (chapterId: string) => {
    return api.privateFetch(`/Chapter/${chapterId}/all-exercises`, {
        method: "GET",
    });
};

const addExercise = async (exercise: Partial<Exercise>) => {
    return api.privateFetch(`/Exercise`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(exercise),
    });
};

const updateExercise = async (
    exerciseId: number,
    exercise: Partial<Exercise>,
) => {
    return api.privateFetch(`/Exercise/${exerciseId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(exercise),
    });
};

const deleteExercise = async (exerciseId: number) => {
    return api.privateFetch(`/Exercise/${exerciseId}`, {
        method: "DELETE",
    });
};

const submitSolution = async (exerciseId: number, query: string) => {
    return api.privateFetch(`/Solution/submit/select`, {
        method: "POST",
        body: JSON.stringify({
            exerciseId,
            query,
        }),
    });
};

export const exerciseService = {
    getExercisesByChapterId,
    getAllExercisesByChapterId,
    addExercise,
    updateExercise,
    deleteExercise,
    submitSolution,
};
