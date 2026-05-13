"use client";

import { Course } from "@/types/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaFileAlt } from "react-icons/fa";
import { FaArrowLeft, FaUsers } from "react-icons/fa6";

export default function AdminCourseDetailsHeader({
    course,
}: {
    course: Course;
}) {
    const pathname = usePathname();

    return (
        <div className="mb-6">
            <Link
                href="/admin"
                className="flex items-center text-blue-500 hover:text-blue-700 gap-1"
            >
                <FaArrowLeft />
                Back to courses
            </Link>

            <h1 className="mt-6">{course.courseNameNL}</h1>
            <p>{course.courseDescriptionNL}</p>
            <p> Lecturer: {course.lecturer}</p>

            <ul className="flex px-2 py-1.5 gap-1 mt-4 w-fit rounded-lg bg-gray-200">
                <li>
                    <Link
                        href={`/admin/course/${course.courseId}`}
                        className={`flex items-center gap-1 px-4 py-1 rounded-lg transition-colors ${
                            pathname == `/admin/course/${course.courseId}`
                                ? "bg-white"
                                : "text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        <FaFileAlt className="text-sm" />
                        Chapters
                    </Link>
                </li>
                <li>
                    <Link
                        href={`/admin/course/${course.courseId}/students`}
                        className={`flex items-center gap-1 px-4 py-1 rounded-lg transition-colors ${
                            pathname ==
                            `/admin/course/${course.courseId}/students`
                                ? "bg-white"
                                : "text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        <FaUsers className="text-sm" />
                        Students
                    </Link>
                </li>
            </ul>
        </div>
    );
}
