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

export interface DBSchema {
    schemaId: number;
    schemaName: string;
    schemaImage?: string | null;
}

export interface Schema {
    schemaId?: number | null;
    schemaName?: string;
    schemaImage?: string;
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
    schema?: Schema
    completedAmount?: number;
}

export enum QueryAction {
    Insert = 1,
    Select = 2,
    Update = 3,
    Delete = 4,
}

export interface Exercise {
    exerciseId: number;
    chapterId: number;
    questionNL: string;
    questionEN: string;
    hintNL: string;
    hintEN: string;
    queryOutput: string;
    queryAction: QueryAction;
    solutionQuery?: string;
    validationQuery?: string;
    
    requirements?: Requirement[];
    solutions?: { solutionId?: number; query: string }[];
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

export interface SubmitResult {
    correct: boolean;
    message: string;
    alreadySolved?: boolean;
    expected?: string;
    actual?: string;
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
