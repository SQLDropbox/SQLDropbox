import { Exercise } from "@/types/types";
import { api } from "./apiClient";

const getExercisesByChapterId = async (chapterId: string) => {
    return api.publicFetch(`/Chapter/${chapterId}/exercises`, {
        method: "GET",
    });
};

/* const addExercise = async (chapterId: string, exercise: Partial<Exercise>) => {
    return api.publicFetch(`/Exercise`, {
        method: "POST",
        body: JSON.stringify(exercise),
    });
};

const updateExercise = async (exerciseId: number, exercise: Partial<Exercise>) => {
    return api.publicFetch(`/Exercise`, {
        method: "PUT",
        body: JSON.stringify(exercise),
    });
};

const deleteExercise = async (exerciseId: number) => {
    return api.publicFetch(`/Exercise`, {
        method: "DELETE",
    });
}; */

export const exerciseService = {
    getExercisesByChapterId,
    // addExercise,
    // updateExercise,
    // deleteExercise,
};