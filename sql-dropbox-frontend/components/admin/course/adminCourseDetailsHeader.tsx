"use client";

import { Course } from "@/types/types";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { FaFileAlt } from "react-icons/fa";
import { FaArrowLeft, FaUsers } from "react-icons/fa6";

export default function AdminCourseDetailsHeader({
    course,
}: {
    course: Course;
}) {
    const pathname = usePathname();
    const locale = useLocale();
    const t = useTranslations("AdminCourseDetailsHeader");

    const courseName =
        locale === "en" ? course.courseNameEN : course.courseNameNL;

    const courseDescription =
        locale === "en"
            ? course.courseDescriptionEN
            : course.courseDescriptionNL;

    return (
        <div className="mb-6">
            <Link
                href="/admin"
                className="flex items-center text-blue-500 hover:text-blue-700 gap-1"
            >
                <FaArrowLeft />
                {t("backToCourses")}
            </Link>

            <h1 className="mt-6">{courseName}</h1>
            <p>{courseDescription}</p>
            <p>
                {t("lecturer")}: {course.lecturer}
            </p>

            <ul className="flex px-2 py-1.5 gap-1 mt-4 w-fit rounded-lg bg-gray-200">
                <li>
                    <Link
                        href={`/admin/${course.courseId}`}
                        className={`flex items-center gap-1 px-4 py-1 rounded-lg transition-colors ${
                            pathname == `/admin/${course.courseId}`
                                ? "bg-white"
                                : "text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        <FaFileAlt className="text-sm" />
                        {t("chapters")}
                    </Link>
                </li>
                <li>
                    <Link
                        href={`/admin/${course.courseId}/students`}
                        className={`flex items-center gap-1 px-4 py-1 rounded-lg transition-colors ${
                            pathname ==
                            `/admin/${course.courseId}/students`
                                ? "bg-white"
                                : "text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        <FaUsers className="text-sm" />
                        {t("students")}
                    </Link>
                </li>
            </ul>
        </div>
    );
}
