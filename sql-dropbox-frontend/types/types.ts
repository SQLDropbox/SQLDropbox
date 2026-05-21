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

export interface Exercise {
    exerciseId: number;
    chapterId: number;
    questionNL: string;
    questionEN: string;
    hintNL: string;
    hintEN: string;
    queryOutput?: string;
    solutionQueries?: string[];
}
export interface Student {
    userCode: string;
    firstName: string;
    lastName: string;
    email: string;
}