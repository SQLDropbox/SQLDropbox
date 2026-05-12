export interface Course {
    courseID: number;
    courseNameNL: string;
    courseNameEN: string;
    courseDescriptionNL: string;
    courseDescriptionEN: string;
    lecturer: string;
    deadline: Date;
    isActive: boolean;
    studentCount: number;
    chapterCount: number;
}
