"use client";

import { Course } from "@/types/types";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { FiBookOpen, FiEdit, FiPlay, FiUsers } from "react-icons/fi";

const rotations = [
    "rotate-[-1deg] hover:rotate-0",
    "rotate-[2deg] hover:rotate-0",
    "rotate-[-1.5deg] hover:rotate-0",
    "rotate-[1deg] hover:rotate-0",
];

const stampRotations = [
    "rotate-[-6deg]",
    "rotate-[10deg]",
    "rotate-[-12deg]",
    "rotate-[-8deg]",
    "rotate-[6deg]",
];

const surfaces = ["bg-surface-1", "bg-surface-2", "bg-surface-3"];

export default function CourseCard({
    course,
    index = 0,
    onEdit,
    adminMode = false,
}: {
    course: Course;
    index?: number;
    onEdit?: () => void;
    adminMode?: boolean;
}) {
    const t = useTranslations("Course");
    const locale = useLocale();

    const row = Math.floor(index / 3);

    const rotation = rotations[(index + row) % rotations.length];
    const surface = surfaces[(index + row) % surfaces.length];
    const stampRotation = stampRotations[index % stampRotations.length];
    const tabSide = index % 2 === 0 ? "left-0" : "right-0";

    const courseName =
        locale === "en" ? course.courseNameEN : course.courseNameNL;

    const courseDesc =
        locale === "en"
            ? course.courseDescriptionEN
            : course.courseDescriptionNL;

    return (
        <article
            className={`
                relative ${surface}
                p-6 border border-border
                shadow-[inset_0_0_0_1px_var(--color-border)]
                transition-transform duration-200 ${rotation}
            `}
            style={{ isolation: "isolate" }}
        >
            {/* Tape */}
            <div
                className={`
                    absolute pointer-events-none
                    -top-2.5 left-1/2
                    -translate-x-1/2 -rotate-2
                    w-20 h-6
                    bg-white/40
                    border border-black/10
                    shadow-[0_1px_2px_rgba(0,0,0,0.05)]
                    z-10
                `}
            />

            {/* Tab */}
            <div
                className={`
                    absolute -top-6 ${tabSide}
                    ${surface}
                    px-4 py-1
                    border border-border border-b-0
                `}
            >
                <span className="font-mono text-xs uppercase tracking-wider text-muted">
                    ID: {course.courseId?.toString().toUpperCase() ?? "—"}
                </span>
            </div>

            {/* Status Stamp */}
            {adminMode && (
                <div
                    className={`
                        absolute top-4 right-4
                        border-2 px-3 py-1
                        font-mono text-[10px] uppercase tracking-widest
                        z-20
                        transition-transform
                        ${stampRotation}
                        ${
                            course.isActive
                                ? "border-ink text-ink opacity-90"
                                : "border-border text-border opacity-70"
                        }
                    `}
                >
                    {course.isActive ? t("statusActive") : t("statusArchived")}
                </div>
            )}

            {/* Header */}
            <header className="mb-6 border-b border-border pb-4 relative z-10">
                <h2 className="font-display text-2xl font-bold text-ink mb-2">
                    {courseName}
                </h2>

                <p className="font-mono text-xs uppercase tracking-wider text-muted">
                    <span className="text-accent mr-2">{t("lecturer")}:</span>
                    {course.lecturer}
                </p>
            </header>

            {/* Description */}
            <p className="font-mono text-sm leading-relaxed text-muted mb-8 line-clamp-3">
                {courseDesc}
            </p>

            {/* Stats */}
            <ul className="font-mono text-xs text-muted space-y-3 mb-8 border-l-2 border-border pl-4">
                <li>{t("students", { count: course.studentCount ?? 0 })}</li>
                <li>{t("chapters", { count: course.chapterCount ?? 0 })}</li>
            </ul>

            {/* Actions */}
            <div className="flex gap-2">
                <Link
                    href={
                        adminMode
                            ? `/admin/${course.courseId}`
                            : `/${course.courseId}`
                    }
                    className={`
                        flex-1 flex items-center justify-center gap-2
                        py-3 font-mono text-xs uppercase tracking-widest
                        border-2 transition-colors border-accent text-accent hover:bg-accent hover:text-paper
                    `}
                >
                    {adminMode ? <FiBookOpen /> : <FiPlay />}
                    {adminMode ? t("manage") : t("startLearning")}
                </Link>

                {adminMode && (
                    <>
                        <Link
                            href={`/admin/${course.courseId}/students`}
                            className="flex items-center justify-center border-2 border-border px-3 py-2 text-muted hover:bg-ink hover:text-paper transition-colors"
                        >
                            <FiUsers />
                        </Link>

                        <button
                            onClick={onEdit}
                            className="flex items-center justify-center border-2 border-border px-3 py-2 text-muted hover:bg-ink hover:text-paper transition-colors"
                        >
                            <FiEdit />
                        </button>
                    </>
                )}
            </div>
        </article>
    );
}
