import { Chapter } from "@/types/types";
import { api } from "./apiClient";

const addChapter = async (courseId: string, chapter: Partial<Chapter>) => {
    const dto = {
        chapterNameNL: chapter.chapterNameNL ?? "",
        chapterNameEN: chapter.chapterNameEN ?? "",
        chapterDescriptionNL: chapter.chapterDescriptionNL ?? "",
        chapterDescriptionEN: chapter.chapterDescriptionEN ?? "",
        amountOfExercises: chapter.amountOfExercises ?? 0,
        schemaId: chapter.schemaId ?? 2,
    };

    return api.privateFetch(`/Chapter/course/${courseId}`, {
        method: "POST",
        body: JSON.stringify(dto),
    });
};

const updateChapter = async (chapterId: number, chapter: Partial<Chapter>) => {
    return api.privateFetch(`/Chapter/${chapterId}`, {
        method: "PUT",
        body: JSON.stringify(chapter),
    });
};

const deleteChapter = async (chapterId: number) => {
    return api.privateFetch(`/Chapter/${chapterId}`, {
        method: "DELETE",
    });
};

const getChapterByChapterId = async (chapterId: string) => {
    return api.privateFetch(`/Chapter/${chapterId}`, {
        method: "GET",
    });
};

const reorderChapters = async (courseId: string, orderedIds: string[]) => {
    return api.privateFetch(`/Chapter/course/${courseId}/reorder`, {
        method: "POST",
        body: JSON.stringify({ orderedIds }),
    });
};

export const chapterService = {
    addChapter,
    updateChapter,
    deleteChapter,
    getChapterByChapterId,
    reorderChapters,
};
