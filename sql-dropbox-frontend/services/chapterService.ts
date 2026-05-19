import { Chapter } from "@/types/types";
import { api } from "./apiClient";

const addChapter = async (courseId: string, chapter: Partial<Chapter>) => {
    return api.publicFetch(`/Chapter/${courseId}`, {
        method: "POST",
        body: JSON.stringify(chapter),
    });
};

const updateChapter = async (chapterId: number, chapter: Partial<Chapter>) => {
    return api.publicFetch(`/Chapter/${chapterId}`, {
        method: "PUT",
        body: JSON.stringify(chapter),
    });
};

const deleteChapter = async (chapterId: number) => {
    return api.publicFetch(`/Chapter/${chapterId}`, {
        method: "DELETE",
    });
};

const getChapterByChapterId = async (chapterId: string) => {
    return api.publicFetch(`/Chapter/${chapterId}`, {
        method: "GET",
    });
};

export const chapterService = {
    addChapter,
    updateChapter,
    deleteChapter,
    getChapterByChapterId,
};
