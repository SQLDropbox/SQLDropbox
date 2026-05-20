export interface Course {
    courseId: string;
    courseNameNL: string;
    courseNameEN: string;
    courseDescriptionNL: string;
    courseDescriptionEN: string;
    lecturer: string;
    isActive: boolean;

    students?: Student[];
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
    amountOfExercises?: number;
    dbSchema?: string; 
    schemaId?: number | null; 
}

export interface Student {
    studentCode: string;
    firstName: string;
    lastName: string;
    email: string;
}