import { api } from "./apiClient";

const getChapterByChapterId = async (chapterId: string) => {
    return api.publicFetch(`/Chapter/${chapterId}`, {
        method: "GET",
    });
};

export const chapterService = {
    getChapterByChapterId,
};
