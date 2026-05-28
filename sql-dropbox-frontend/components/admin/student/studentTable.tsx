"use client";

import { Course } from "@/types/types";
import ProgressIcon from "../chapter/progressIcon";
import StudentTableLegend from "./studentTableLegend";
import StudentTableHead from "./studentTableHead";

const STAMP_ROTS = [-6, 10, -12, -8, 6, -3, 8, -5, 4, -9];

const TAPE_CORNERS = [
    "top-2 -left-4 -rotate-45",
    "top-2 -right-4 rotate-45",
    "bottom-2 -left-4 rotate-45",
    "bottom-2 -right-4 -rotate-45",
] as const;

export default function StudentTable({ course }: { course: Course }) {
    const students = [...(course.students ?? [])];

    const colCount = (course.chapters?.length ?? 0) + 2;
    const totalExercises =
        course.chapters?.reduce((s, c) => s + (c.amountOfExercises ?? 0), 0) ??
        0;

    return (
        <div
            className="relative bg-paper bg-ruled border-2 border-border p-10"
            style={{ isolation: "isolate" }}
        >
            {/* Tape corners */}
            {TAPE_CORNERS.map((cls, i) => (
                <div
                    key={i}
                    className={`absolute w-18 h-5.5 bg-[rgba(232,226,208,0.65)] border border-[rgba(138,113,109,0.2)] shadow-[0_1px_3px_rgba(0,0,0,0.08)] z-10 ${cls}`}
                />
            ))}

            {/* Header */}
            <div className="mb-8 pb-4 relative z-10 border-b-2 border-accent">
                <h1 className="font-display text-[1.75rem] font-bold text-accent uppercase tracking-tighter -rotate-1 inline-block mb-1">
                    MASTER STUDENT LEDGER
                </h1>
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted mt-1">
                    VOL. {String(course.courseId ?? "—").toUpperCase()} —{" "}
                    PROGRESS TRACKING SHEET
                </p>
            </div>

            {/* Table */}
            <div className="relative z-10 overflow-x-auto overflow-y-auto">
                <table
                    className="w-full text-left border-collapse"
                    style={{
                        minWidth: `${260 + (course.chapters?.length ?? 0) * 100}px`,
                    }}
                >
                    <StudentTableHead course={course} />

                    <tbody>
                        {students.length > 0 ? (
                            students.map((student) => {
                                const totalCompleted =
                                    student.chapters?.reduce(
                                        (s, c) => s + (c.completedAmount ?? 0),
                                        0,
                                    ) ?? 0;
                                const isStalled =
                                    totalCompleted === 0 && totalExercises > 0;

                                return (
                                    <tr
                                        key={student.userCode}
                                        className={[
                                            "group border-b border-border",
                                            isStalled
                                                ? "bg-[rgba(108,18,8,0.06)]"
                                                : "",
                                        ].join(" ")}
                                    >
                                        {/* Code */}
                                        <td
                                            className={[
                                                "p-3 font-mono text-[11px] text-muted",
                                                "border-r border-border",
                                                "sticky left-0 z-10 whitespace-nowrap",
                                                isStalled
                                                    ? "bg-[rgba(108,18,8,0.06)] border-l-[3px] border-l-accent"
                                                    : "bg-paper",
                                            ].join(" ")}
                                        >
                                            {student.userCode}
                                        </td>

                                        {/* Name */}
                                        <td
                                            className={[
                                                "p-3 font-bold text-ink",
                                                "border-r border-border",
                                                "sticky z-10 whitespace-nowrap",
                                                isStalled
                                                    ? "bg-[rgba(108,18,8,0.06)]"
                                                    : "bg-paper",
                                            ].join(" ")}
                                            style={{ left: 80 }}
                                        >
                                            {student.firstName}{" "}
                                            {student.lastName}
                                        </td>

                                        {/* Chapter cells */}
                                        {course.chapters?.map((chapter, i) => {
                                            const completedChapter =
                                                student.chapters?.find(
                                                    (c) =>
                                                        c.chapterId ===
                                                        chapter.chapterId,
                                                );
                                            return (
                                                <td
                                                    key={chapter.chapterId}
                                                    className={[
                                                        "p-2 text-center",
                                                        i <
                                                        (course.chapters
                                                            ?.length ?? 0) -
                                                            1
                                                            ? "border-r border-border"
                                                            : "",
                                                        i % 2 === 1
                                                            ? "bg-[rgba(0,0,0,0.025)]"
                                                            : "",
                                                    ].join(" ")}
                                                >
                                                    <ProgressIcon
                                                        completed={
                                                            completedChapter?.completedAmount ??
                                                            0
                                                        }
                                                        total={
                                                            chapter.amountOfExercises ??
                                                            0
                                                        }
                                                    />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td
                                    colSpan={colCount}
                                    className="p-6 text-center font-mono text-xs text-muted uppercase tracking-[0.1em] border-t border-border"
                                >
                                    — NO PERSONNEL ON RECORD —
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <StudentTableLegend />

            {/* Footer stamp */}
            <div className="absolute bottom-4 right-6 pointer-events-none font-mono text-[10px] text-accent opacity-30 rotate-[2deg] border border-current px-2 py-0.5 uppercase tracking-[0.1em]">
                RECORDING NO. {String(course.courseId ?? "—").toUpperCase()}
            </div>
        </div>
    );
}
