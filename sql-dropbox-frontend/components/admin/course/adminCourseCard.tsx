"use client";

import { Course } from "@/types/types";
import Link from "next/link";
import { useState } from "react";
import { FaUsers, FaFileAlt, FaBookOpen, FaEdit } from "react-icons/fa";
import EditCourseDialog from "@/components/admin/course/editCourseDialog";

export default function AdminCourseCard({ course }: { course: Course }) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {course.courseNameNL}
                    </h3>

                    <p className="text-sm text-gray-500 mb-4">
                        {course.lecturer}
                    </p>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaUsers className="text-sm" />
                            {course.studentCount} students
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaFileAlt className="text-sm" />
                            {course.chapterCount} chapters
                        </div>
                    </div>
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

            <div className="flex gap-2 pt-4 border-t border-gray-200">
                <Link
                    href={`/admin/course/${course.courseID}`}
                    className="flex-1"
                >
                    <button className="w-full flex items-center justify-center gap-2 bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                        <FaBookOpen />
                        Manage
                    </button>
                </Link>

                <Link
                    href={`/admin/course/${course.courseID}/students`}
                    className="flex items-center border border-gray-400 rounded-lg px-3 py-2 transition-colors bg-white hover:bg-gray-200 text-gray-900 text-sm cursor-pointer"
                >
                    <FaUsers />
                </Link>

                <button
                    className="border border-gray-400 rounded-lg px-3 py-2 transition-colors bg-white hover:bg-gray-200 text-gray-900 text-sm cursor-pointer"
                    onClick={() => setEditDialogOpen(true)}
                >
                    <FaEdit />
                </button>
            </div>
            <EditCourseDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                course={course}
            />
        </div>
    );
}
