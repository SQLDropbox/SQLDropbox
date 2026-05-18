export interface Course {
    chapters: any;
    courseId: number;
    courseNameNL: string;
    courseNameEN: string;
    courseDescriptionNL: string;
    courseDescriptionEN: string;
    lecturer: string;
    url: string;
    deadline?: Date | null;
    isActive: boolean;

    studentCount?: number;
    chapterCount?: number;
}

export interface Chapter {
    chapterId: number;
    chapterNameNL: string;
    chapterNameEN: string;
    chapterDescriptionNL: string;
    chapterDescriptionEN: string;
    amountOfExercises?: number;
    dbSchema?: string;
    courseId: number;
}
