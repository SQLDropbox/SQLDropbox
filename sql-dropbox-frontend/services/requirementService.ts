import { api } from "./apiClient";
import { Requirement, RequirementDTO } from "@/types/types";

const getRequirementsForExercise = async (
    exerciseId: number,
): Promise<Requirement[]> => {
    return api.privateFetch(`/Requirement/exercise/${exerciseId}`, {
        method: "GET",
    });
};

const createRequirementForExercise = async (
    dto: RequirementDTO,
) => {
    return api.privateFetch("/Requirement/create", {
        method: "POST",
        body: JSON.stringify(dto),
    });
};

const updateRequirementForExercise = async (
    requirementId: number,
    dto: RequirementDTO,
) => {
    return api.privateFetch(`/Requirement/update/${requirementId}`, {
        method: "POST",
        body: JSON.stringify(dto),
    });
};

const deleteRequirementForExercise = async (requirementId: number) => {
    return api.privateFetch(`/Requirement/delete/${requirementId}`, {
        method: "DELETE",
    });
};

export const requirementService = {
    getRequirementsForExercise,
    createRequirementForExercise,
    updateRequirementForExercise,
    deleteRequirementForExercise,
};