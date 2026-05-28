export interface Course {
    courseId: string;
    courseNameNL: string;
    courseNameEN: string;
    courseDescriptionNL: string;
    courseDescriptionEN: string;
    lecturer: string;
    isActive: boolean;

    students?: User[];
    chapters?: Chapter[];

    studentCount?: number;
    chapterCount?: number;
    amountOfExercises?: number;
    totalCourseCount?: number;
}

export interface DBSchema {
    schemaId: number;
    schemaName: string;
    schemaImage?: string | null;
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
    requirements?: Requirement[];
}

export interface Requirement {
    requirementId: number;
    statement: string;
    use: boolean;
    exerciseId?: number;
    createdAt?: string;
    updatedAt?: string | null;
    deletedAt?: string | null;
}

export interface RequirementDTO {
    statement?: string;
    use: boolean;
    exerciseId?: number | null;
}

export interface User {
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