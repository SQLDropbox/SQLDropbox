"use client";

import { Course } from "@/types/types";
import Link from "next/link";
import { FaUsers, FaFileAlt, FaBookOpen, FaEdit } from "react-icons/fa";

export default function AdminCourseCard({
    course,
    onEdit,
}: {
    course: Course;
    onEdit: () => void;
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg transition-shadow flex flex-col gap-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {course.courseNameEN}
                    </h3>

                    <p className="text-sm text-gray-500">
                        Lecturer: {course.lecturer}
                    </p>

                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {course.courseDescriptionEN}
                    </p>
                </div>

                <span
                    className={`text-xs px-3 py-1 rounded-lg border border-gray-200 font-medium ${
                        course.isActive
                            ? "bg-gray-900 text-white"
                            : "bg-gray-200 text-gray-600"
                    }`}
                >
                    {course.isActive ? "Active" : "Inactive"}
                </span>
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaUsers className="text-sm" />
                    {course.studentCount ?? 0} students
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaFileAlt className="text-sm" />
                    {course.chapterCount ?? 0} chapters
                </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200">
                <Link
                    href={`/admin/course/${course.courseId}`}
                    className="flex-1 w-full flex items-center justify-center gap-2 bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                >
                    <FaBookOpen />
                    Manage
                </Link>

                <Link
                    href={`/admin/course/${course.courseId}/students`}
                    className="flex items-center border border-gray-400 rounded-lg px-3 py-2 transition-colors bg-white hover:bg-gray-200 text-gray-900 text-sm cursor-pointer"
                    title="Manage students"
                >
                    <FaUsers />
                </Link>

                <button
                    className="border border-gray-400 rounded-lg px-3 py-2 transition-colors bg-white hover:bg-gray-200 text-gray-900 text-sm cursor-pointer"
                    onClick={onEdit}
                    title="Edit course"
                >
                    <FaEdit />
                </button>
            </div>
        </div>
    );
}
