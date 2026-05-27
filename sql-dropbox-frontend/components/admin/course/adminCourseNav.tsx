"use client";

import { Course } from "@/types/types";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { FaFileAlt } from "react-icons/fa";
import { FaUsers } from "react-icons/fa6";

export default function AdminCourseNav({ course }: { course: Course }) {
    const pathname = usePathname();
    const t = useTranslations("AdminCourseDetailsHeader");

    return (
        <ul className="flex px-2 py-1.5 gap-1 mt-4 w-fit border-2 border-border">
            <li>
                <Link
                    href={`/admin/${course.courseId}`}
                    className={`flex items-center gap-1 px-4 py-1 transition-colors ${
                        pathname == `/admin/${course.courseId}` 
                            ? "bg-accent text-paper"
                            : "bg-text-ink hover:bg-surface-3"
                    }`}
                >
                    <FaFileAlt className="text-sm" />
                    {t("chapters")}
                </Link>
            </li>
            <li>
                <Link
                    href={`/admin/${course.courseId}/students`}
                    className={`flex items-center gap-1 px-4 py-1 transition-colors ${
                        pathname == `/admin/${course.courseId}/students`
                            ? "bg-accent text-paper"
                            : "bg-text-ink hover:bg-surface-3"
                    }`}
                >
                    <FaUsers className="text-sm" />
                    {t("students")}
                </Link>
            </li>
        </ul>
    );
}
