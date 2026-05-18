export interface Course {
    courseId: string;
    courseNameNL: string;
    courseNameEN: string;
    courseDescriptionNL: string;
    courseDescriptionEN: string;
    lecturer: string;
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
    courseId: string;
    exerciseCount: number;
    dbSchema?: string;
}