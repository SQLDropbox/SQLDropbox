export interface Course {
    courseId: number;
    courseNameNL: string;
    courseNameEN: string;
    courseDescriptionNL: string;
    courseDescriptionEN: string;
    lecturer: string;
    url: string;
    deadline?: Date | null;
    isActive: boolean;

    chapters?: Chapter[];

    studentCount?: number;
    chapterCount?: number;
}

export interface Chapter {
    chapterId: number;
    chapterNameNL: string;
    chapterNameEN: string;
    chapterDescriptionNL: string;
    chapterDescriptionEN: string;
    courseId: number;
    exerciseCount: number;
    dbSchema?: string;
}