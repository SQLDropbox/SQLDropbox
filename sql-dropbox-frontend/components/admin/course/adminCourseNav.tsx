"use client";

import { Course } from "@/types/types";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { FaChalkboardTeacher, FaFileAlt } from "react-icons/fa";
import { FaUsers } from "react-icons/fa6";

const navItems = (courseId: string) => [
    {
        href: `/admin/${courseId}`,
        icon: FaFileAlt,
        labelKey: "chapters",
    },
    {
        href: `/admin/${courseId}/students`,
        icon: FaUsers,
        labelKey: "students",
    },
    {
        href: `/admin/${courseId}/lecturers`,
        icon: FaChalkboardTeacher,
        labelKey: "lecturers",
    }
];

export default function AdminCourseNav({ course }: { course: Course }) {
    const pathname = usePathname();
    const t = useTranslations("AdminCourseNav");

    return (
        <aside className="
            hidden md:flex flex-col
            w-56 shrink-0
            sticky top-0 h-screen
            bg-surface-1
            border-r-2 border-border
            py-8 gap-4
            overflow-y-auto
        ">
            <div className="px-6 mb-6">
                <div className="font-display text-2xl font-bold text-ink -rotate-1 inline-block mb-1">
                    {String(course.courseId ?? "—").toUpperCase()}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted border-b border-border pb-2 mt-1">
                    RECORDING NO. {String(course.courseId ?? "—").toUpperCase()}-SQL
                </div>
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-1 flex-1 px-2">
                {navItems(String(course.courseId)).map(({ href, icon: Icon, labelKey }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`
                                flex items-center gap-3 px-4 py-2.5 mx-2
                                font-mono text-xs uppercase tracking-widest
                                transition-all duration-150
                                ${isActive
                                    ? "bg-accent text-paper -rotate-1 scale-105 shadow-sm"
                                    : "text-muted hover:translate-x-1 hover:bg-surface-2 hover:text-ink rotate-[0.5deg] active:-rotate-1"
                                }
                            `}
                        >
                            <Icon className="shrink-0 text-sm" />
                            {t(labelKey)}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}