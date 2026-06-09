"use client";

import { Course } from "@/types/types";
import LecturerTableHead from "./lecturerTableHead";
import LecturerTableRow from "./lecturerTableRow";
import { useState } from "react";
import { FaUserPlus, FaSearch } from "react-icons/fa";
import { useTranslations } from "next-intl";

const TAPE_CORNERS = [
    "top-2 -left-4 -rotate-45",
    "top-2 -right-4 rotate-45",
    "bottom-2 -left-4 rotate-45",
    "bottom-2 -right-4 -rotate-45",
] as const;

type Props = {
    course: Course;
    onAddManual: () => void;
    onRemoveSuccess: () => void;
};

export default function LecturerTable({ course, onAddManual, onRemoveSuccess }: Props) {
    const [search, setSearch] = useState("");
    const t = useTranslations("LecturerTable");

    const filteredLecturers = (course.lecturers ?? []).filter(
        (l) =>
            `${l.firstName} ${l.lastName}`
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            l.userId.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div className="max-w-7xl relative bg-paper bg-ruled border-2 border-border p-10">
            {/* Tape corners */}
            {TAPE_CORNERS.map((cls, i) => (
                <div
                    key={i}
                    className={`absolute w-18 h-5.5 bg-surface-1/40 border border-border/20 shadow-[0_1px_2px_rgba(0,0,0,0.05)] z-10 ${cls}`}
                />
            ))}

            {/* Header */}
            <div className="mb-8 pb-4 relative z-10 border-b-2 border-accent flex items-end justify-between gap-4 flex-wrap">
                {/* Title block */}
                <div>
                    <h1 className="font-display text-[1.75rem] font-bold text-accent uppercase tracking-tighter -rotate-1 inline-block mb-1">
                        {t("title")}
                    </h1>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-muted mt-1">
                        {t("assignedPersonnel", { courseId: String(course.courseId ?? "—").toUpperCase() })}
                    </p>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-2 mb-1">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={t("searchPlaceholder")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="
                                bg-paper border border-border
                                pl-3 pr-8 py-1.5
                                font-mono text-[11px] tracking-wider text-ink
                                placeholder:text-border
                                focus:outline-none focus:border-accent
                                w-52
                            "
                        />
                        <FaSearch className="absolute right-2.5 top-1/2 -translate-y-1/2 text-border text-[10px]" />
                    </div>

                    {/* Add Lecturer */}
                        <button
                            onClick={onAddManual}
                            className="
                            flex items-center gap-1.5
                            border border-border px-3 py-1.5
                            font-mono text-[11px] uppercase tracking-wider text-muted
                            hover:border-ink hover:text-ink hover:bg-surface-1
                            transition-colors
                        "
                        >
                            <FaUserPlus className="text-[10px]" />
                            {t("assignLecturer")}
                        </button>
                </div>
            </div>

            {/* Table */}
            <table className="w-full text-left border-collapse min-w-[600px]">
                <LecturerTableHead />
                <tbody>
                    {filteredLecturers.length > 0 ? (
                        filteredLecturers.map((lecturer, rowIndex) => (
                            <LecturerTableRow
                                key={lecturer.userId}
                                lecturer={lecturer}
                                courseId={course.courseId}
                                rowIndex={rowIndex}
                                onRemoveSuccess={onRemoveSuccess}
                            />
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={3}
                                className="p-6 text-center font-mono text-xs text-muted uppercase tracking-widest border-t border-border bg-surface-1"
                            >
                                {t("noInstructors")}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Footer stamp */}
            <div className="absolute bottom-4 right-6 pointer-events-none font-mono text-[10px] text-accent opacity-30 rotate-[2deg] border border-current px-2 py-0.5 uppercase tracking-[0.1em]">
                {t("recordingNo", { courseId: String(course.courseId ?? "—").toUpperCase() })}
            </div>
        </div>
    );
}