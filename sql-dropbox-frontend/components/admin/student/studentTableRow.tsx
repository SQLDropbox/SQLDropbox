import { Course, User } from "@/types/types";
import ProgressIcon from "../chapter/progressIcon";

export default function StudentTableRow({
    student,
    course,
    rowIndex,
}: {
    student: User;
    course: Course;
    rowIndex: number;
}) {
    const totalCompleted =
        student.chapters?.reduce((s, c) => s + (c.completedAmount ?? 0), 0) ??
        0;

    const totalExercises =
        course.chapters?.reduce((s, c) => s + (c.amountOfExercises ?? 0), 0) ??
        0;

    const isStalled = totalCompleted === 0 && totalExercises > 0;
    const isEvenRow = rowIndex % 2 === 0;

    const rowBg = isStalled
        ? "bg-[rgba(108,18,8,0.06)]"
        : isEvenRow
          ? "bg-paper"
          : "bg-surface-3";

    return (
        <tr
            className={`group border-b border-border divide-x divide-border ${rowBg} transition-colors`}
        >
            {/* Code */}
            <td
                className={`
                    p-3 font-mono text-[11px] text-muted tracking-wide uppercase whitespace-nowrap
                    ${isStalled ? "border-l-[3px] border-l-accent" : ""}
                `}
            >
                {student.userCode}
            </td>

            {/* Name */}
            <td className="p-3 font-bold text-ink whitespace-nowrap bg-black/[0.035]">
                {student.firstName} {student.lastName}
            </td>

            {/* Chapters */}
            {course.chapters?.map((chapter, colIndex) => {
                const completedChapter = student.chapters?.find(
                    (c) => c.chapterId === chapter.chapterId,
                );
                const colStripe = colIndex % 2 === 1 ? "bg-black/[0.035]" : "";

                return (
                    <td
                        key={chapter.chapterId}
                        className={colStripe}
                    >
                        <div className="flex justify-center items-center w-full">
                            <ProgressIcon
                                completed={
                                    completedChapter?.completedAmount ?? 0
                                }
                                total={chapter.amountOfExercises ?? 0}
                            />
                        </div>
                    </td>
                );
            })}
        </tr>
    );
}
