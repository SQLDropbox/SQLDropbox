"use client";

import { Course } from "@/types/types";
import StudentTableLegend from "./studentTableLegend";
import StudentTableHead from "./studentTableHead";
import StudentTableRow from "./studentTableRow";

const TAPE_CORNERS = [
    "top-2 -left-4 -rotate-45",
    "top-2 -right-4 rotate-45",
    "bottom-2 -left-4 rotate-45",
    "bottom-2 -right-4 -rotate-45",
] as const;

export default function StudentTable({ course }: { course: Course }) {
    const colCount = (course.chapters?.length ?? 0) + 2;

    return (
        <div className="relative bg-paper bg-ruled border-2 border-border p-10">
            {/* Tape corners */}
            {TAPE_CORNERS.map((cls, i) => (
                <div
                    key={i}
                    className={`absolute w-18 h-5.5 bg-surface-1/40 border border-border/20 shadow-[0_1px_2px_rgba(0,0,0,0.05)] z-10 ${cls}`}
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
            <table
                className="w-full text-left border-collapse"
                style={{
                    minWidth: `${260 + (course.chapters?.length ?? 0) * 100}px`,
                }}
            >
                <StudentTableHead course={course} />
                <tbody>
                    {course?.students?.length ?? 0 > 0 ? (
                        course?.students?.map((student, rowIndex) => {
                            return (
                                <StudentTableRow
                                    key={student.userCode}
                                    student={student}
                                    course={course}
                                    rowIndex={rowIndex}
                                />
                            );
                        })
                    ) : (
                        <tr>
                            <td
                                colSpan={colCount}
                                className="p-6 text-center font-mono text-xs text-muted uppercase tracking-widest border-t border-border"
                            >
                                — NO PERSONNEL ON RECORD —
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Legend */}
            <StudentTableLegend />

            {/* Footer stamp */}
            <div className="absolute bottom-4 right-6 pointer-events-none font-mono text-[10px] text-accent opacity-30 rotate-[2deg] border border-current px-2 py-0.5 uppercase tracking-[0.1em]">
                RECORDING NO. {String(course.courseId ?? "—").toUpperCase()}
            </div>
        </div>
    );
}
