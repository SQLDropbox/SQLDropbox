import { Chapter } from "@/types/types";
import { api } from "./apiClient";

const updateChapter = async (chapterId: number, chapter: Chapter) => {
    return api.publicFetch(`/Chapter/${chapterId}`, {
        method: "PUT",
        body: JSON.stringify(chapter),
    });
};

export const chapterService = {
    updateChapter,
};