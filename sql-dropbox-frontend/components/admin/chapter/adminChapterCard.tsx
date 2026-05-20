"use client";

import { Chapter } from "@/types/types";
import Link from "next/link";
import { FaBookOpen, FaEdit, FaBars, FaFileAlt } from "react-icons/fa";

export default function AdminChapterCard({chapter, onEdit}: {chapter: Chapter; onEdit: () => void;}) {
    return (
        <div className="flex justify-between items-center rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {chapter.chapterNameNL}
                </h3>

                <p className="text-sm text-gray-500 mb-3">
                    {chapter.chapterDescriptionNL}
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaFileAlt className="text-sm" />
                    {chapter.amountOfExercises} exercises
                </div>
            </div>

            <div className="flex gap-2 items-center">
                <Link
                    href={`/admin/${chapter.courseId}/chapter/${chapter.chapterId}/exercises`}
                    className="flex items-center justify-center gap-2 bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <FaBookOpen />
                    Questions
                </Link>

                <button
                    className="w-10 h-10 flex justify-center items-center border border-gray-300 rounded-lg bg-white hover:bg-gray-100"
                    onClick={onEdit}
                >
                    <FaEdit />
                </button>

                <div className="flex justify-center items-center ml-2 pl-4 border-l border-gray-300 text-gray-500">
                    <FaBars />
                </div>
            </div>
        </div>
    );
}