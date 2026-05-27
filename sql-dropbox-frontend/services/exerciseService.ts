import { Exercise } from "@/types/types";
import { api } from "./apiClient";

const mapToExerciseDto = (exercise: Partial<Exercise>) => {
    return {
        questionNL: exercise.questionNL ?? "",
        questionEN: exercise.questionEN ?? "",
        hintNL: exercise.hintNL ?? "",
        hintEN: exercise.hintEN ?? "",
        chapterId: exercise.chapterId,
        solutionQuery: (exercise.solutionQueries ?? [])
            .filter((q) => q && q.trim() !== "")
            .join("\n"),
    };
};

const getExercisesByChapterId = async (chapterId: string) => {
    return api.privateFetch(`/Chapter/${chapterId}/exercises`, {
        method: "GET",
    });
};

const addExercise = async (exercise: Partial<Exercise>) => {const payload = mapToExerciseDto(exercise);

    return api.publicFetch(`/Exercise`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
};

const updateExercise = async (exerciseId: number,  exercise: Partial<Exercise>) => {const payload = mapToExerciseDto(exercise);

    return api.publicFetch(`/Exercise/${exerciseId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
};

const deleteExercise = async (exerciseId: number) => {
    return api.publicFetch(`/Exercise/${exerciseId}`, {
        method: "DELETE",
    });
};

export const exerciseService = {
    getExercisesByChapterId,
    addExercise,
    updateExercise,
    deleteExercise,
};