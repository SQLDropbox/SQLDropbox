"use client";

import { Course } from "@/types/types";
import StudentTableLegend from "./studentTableLegend";
import StudentTableHead from "./studentTableHead";
import StudentTableRow from "./studentTableRow";
import { useEffect, useMemo, useState } from "react";
import { FaUpload, FaUserPlus } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
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
    onUpload: () => void;
};

function useDebouncedValue<T>(value: T, delay = 200) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function StudentTable({ course, onAddManual, onUpload }: Props) {
    const [search, setSearch] = useState("");
    const t = useTranslations("StudentTable");
    const debouncedSearch = useDebouncedValue(search, 250);

    const filteredStudents = useMemo(() => {
        const q = debouncedSearch.toLowerCase();

        return (course.students ?? []).filter(
            (s) =>
                `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
                s.userCode.toLowerCase().includes(q),
        );
    }, [course.students, debouncedSearch]);

    const studentChapterMap = useMemo(() => {
        const map = new Map<string, Map<number, number>>();

        for (const s of course.students ?? []) {
            const chapterMap = new Map<number, number>();

            for (const c of s.chapters ?? []) {
                chapterMap.set(c.chapterId, c.completedAmount ?? 0);
            }

            map.set(s.userCode, chapterMap);
        }

        return map;
    }, [course.students]);

    const colCount = (course.chapters?.length ?? 0) + 2;

    return (
        <div className="max-w-7xl relative bg-paper bg-ruled border-2 border-border shadow-lg">
            {/* Tape corners */}
            {TAPE_CORNERS.map((cls, i) => (
                <div
                    key={i}
                    className={`absolute w-18 h-5.5 bg-surface-1/40 border border-border/20 shadow-[0_1px_2px_rgba(0,0,0,0.05)] z-10 ${cls}`}
                />
            ))}

            {/* Header */}
            <div className="px-10 pt-10 pb-4 relative z-10 border-b-2 border-accent flex items-end justify-between gap-4 flex-wrap">
                {/* Title block */}
                <div>
                    <h1 className="font-display text-[1.75rem] font-bold text-accent uppercase tracking-tighter -rotate-1 inline-block mb-1">
                        {t("title")}
                    </h1>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-muted mt-1">
                        {t("progressSheet", { courseId: String(course.courseId ?? "—").toUpperCase() })}
                    </p>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-2 mb-1">
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
                            {t("enroll")}
                        </button>

                    <button
                        onClick={onUpload}
                        className="
                            flex items-center gap-1.5
                            border-2 border-accent px-3 py-1.5
                            font-mono text-[11px] uppercase tracking-wider text-accent
                            hover:bg-accent hover:text-paper
                            transition-colors
                        "
                    >
                        <FaUpload className="text-[10px]" />
                        {t("upload")}
                    </button>
                </div>
            </div>
            <p className="font-mono text-[11px] mx-10 mt-4 text-muted">
                students found: {filteredStudents.length} /{" "}
                {course.students?.length ?? 0}
            </p>

            <div className="overflow-auto mx-10 my-4 h-[70vh]">
                {filteredStudents.length > 0 ? (
                    <div
                        style={{
                            minWidth: `${400 + (course.chapters?.length ?? 0) * 80}px`,
                        }}
                    >
                        <StudentTableHead course={course} />

                        {filteredStudents.map((student, rowIndex) => (
                            <StudentTableRow
                                key={student.userCode}
                                student={student}
                                course={course}
                                rowIndex={rowIndex}
                                chapterMap={studentChapterMap.get(student.userCode)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="p-6 text-center font-mono text-xs text-muted uppercase tracking-widest border-t border-border">
                        {t("noPersonnel")}
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="p-10 left-0 sticky pt-6 border-t border-border">
                <StudentTableLegend />
            </div>

            {/* Footer stamp */}
            <div className="absolute bottom-4 right-6 pointer-events-none font-mono text-[10px] text-accent opacity-30 rotate-[2deg] border border-current px-2 py-0.5 uppercase tracking-[0.1em]">
                {t("recordingNo", { courseId: String(course.courseId ?? "—").toUpperCase() })}
            </div>
        </div>
    );
}
