"use client";

import { Course } from "@/types/types";
import Link from "next/link";
import { FaUsers, FaFileAlt, FaBookOpen, FaEdit, FaPlay } from "react-icons/fa";
import { useLocale, useTranslations } from "next-intl";

export default function CourseCard({
    course,
    onEdit,
    adminMode = false,
}: {
    course: Course;
    onEdit?: () => void;
    adminMode?: boolean;
}) {
    const t = useTranslations("Course");
    const locale = useLocale();

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg transition-shadow flex flex-col gap-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {locale === "en" ? course.courseNameEN : course.courseNameNL}
                    </h3>

                    <p className="text-sm text-gray-500">
                        {t("lecturer")}: {course.lecturer}
                    </p>

                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {locale === "en" ? course.courseDescriptionEN : course.courseDescriptionNL}
                    </p>
                </div>

                {adminMode && (
                    <span
                        className={`text-xs px-3 py-1 rounded-lg border border-gray-200 font-medium ${
                            course.isActive
                                ? "bg-gray-900 text-white"
                                : "bg-gray-200 text-gray-600"
                        }`}
                    >
                        {course.isActive ? t("active") : t("inactive")}
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaUsers className="text-sm" />
                    {t("students", { count: course.studentCount ?? 0 })}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaFileAlt className="text-sm" />
                    {t("chapters", { count: course.chapterCount ?? 0 })}
                </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200">
                <Link
                    href={
                        adminMode
                            ? `/admin/${course.courseId}`
                            : `/${course.courseId}`
                    }
                    className="flex-1 w-full flex items-center justify-center gap-2 bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                >
                    {adminMode ? <FaBookOpen /> : <FaPlay />}
                    {adminMode ? t("manage") : t("startLearning")}
                </Link>

                {adminMode && (
                    <>
                        <Link
                            href={`/admin/${course.courseId}/students`}
                            className="flex items-center border border-gray-400 rounded-lg px-3 py-2 transition-colors bg-white hover:bg-gray-200 text-gray-900 text-sm cursor-pointer"
                            title={t("manageStudents")}
                        >
                            <FaUsers />
                        </Link>

                        <button
                            className="border border-gray-400 rounded-lg px-3 py-2 transition-colors bg-white hover:bg-gray-200 text-gray-900 text-sm cursor-pointer"
                            onClick={onEdit}
                            title={t("editCourse")}
                        >
                            <FaEdit />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
