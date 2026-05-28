export interface Course {
    courseId: string;
    courseNameNL: string;
    courseNameEN: string;
    courseDescriptionNL: string;
    courseDescriptionEN: string;
    isActive: boolean;

    lecturers?: Lecturer[];
    lecturerIds?: string[];

    students?: User[];
    chapters?: Chapter[];

    studentCount?: number;
    chapterCount?: number;
    amountOfExercises?: number;
    totalCourseCount?: number;
}

export interface Chapter {
    chapterId: number;
    chapterNameNL: string;
    chapterNameEN: string;
    chapterDescriptionNL: string;
    chapterDescriptionEN: string;
    courseId: string;
    amountOfExercises?: number;
    order?: number | null;
    dbSchema?: string;
    schemaId?: number | null;
    completedAmount?: number;
    schemaName?: string;
    schemaImage?: string | null;
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
export interface User {
    userCode: string;
    firstName: string;
    lastName: string;
    email: string;

    chapters?: Chapter[];
}

export interface QueryResponse {
    commandType: string;
    message?: string;
    tableName?: string;
    csvContent?: string;
    columns?: string[] | null;
}

export interface QueryExecutionResult {
    type: "csv" | "json";
    data: any;
}

export interface Lecturer {
    userId: string;
    userCode: string;
    firstName: string;
    lastName: string;
}