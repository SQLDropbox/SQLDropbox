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