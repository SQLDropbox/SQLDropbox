import { Course, User } from "@/types/types";
import ProgressIcon from "../chapter/progressIcon";
import { COL_CODE_W, COL_NAME_W, COL_CHAPTER_W } from "./studentTableHead";
import React from "react";

export default React.memo(function StudentTableRow({
    student,
    course,
    rowIndex,
    chapterMap,
}: {
    student: User;
    course: Course;
    rowIndex: number;
    chapterMap?: Map<number, number>;
}) {
    const isEvenRow = rowIndex % 2 === 0;
    const rowBg = isEvenRow ? "bg-paper/50" : "bg-surface-3/50";

    return (
        <div
            className={`flex border-b border-border ${rowBg} transition-colors group`}
        >
            {/* Code */}
            <div
                className={`${COL_CODE_W} shrink-0 p-3 font-mono text-[11px] text-muted truncate tracking-wide uppercase whitespace-nowrap`}
            >
                {student.userCode}
            </div>

            {/* Name */}
            <div
                className={`${COL_NAME_W} shrink-0 p-3 border-l border-border font-bold truncate text-ink whitespace-nowrap bg-black/[0.035]`}
            >
                {student.firstName} {student.lastName}
            </div>

            {/* Chapters */}
            {course.chapters?.map((chapter, colIndex) => {
                const completed = chapterMap?.get(chapter.chapterId) ?? 0;
                const colStripe = colIndex % 2 === 1 ? "bg-black/[0.035]" : "";

                return (
                    <div
                        key={chapter.chapterId}
                        className={`${COL_CHAPTER_W} shrink-0 border-l border-border flex justify-center items-center ${colStripe}`}
                    >
                        <ProgressIcon
                            completed={completed}
                            total={chapter.amountOfExercises ?? 0}
                        />
                    </div>
                );
            })}
        </div>
    );
});
