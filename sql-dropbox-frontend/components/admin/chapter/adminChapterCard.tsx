"use client";

import { Chapter } from "@/types/types";
import Link from "next/link";
import { useState } from "react";
import { FaUsers, FaFileAlt, FaBookOpen, FaEdit, FaBars } from "react-icons/fa";
import EditChapterDialog from "./editChapterDialog";

export default function AdminChapterCard({ chapter }: { chapter: Chapter }) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    return (
        <div className="flex justify-between items-center rounded-xl border border-gray-200 bg-white px-6 py-3 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {chapter.chapterNameNL}
                    </h3>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaUsers className="text-sm" />
                            {chapter.exerciseCount} exercises
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 justify-between">
                <div className="w-10"></div>
                <Link
                    href={`/admin/course/${chapter.chapterID}`}
                    className="w-100 flex items-center justify-center gap-2 bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                >
                    <FaBookOpen />
                    Questions
                </Link>

                <button
                    className="w-10 flex justify-center items-center border border-gray-400 rounded-lg px-3 py-2 transition-colors bg-white hover:bg-gray-200 text-gray-900 text-sm cursor-pointer"
                    onClick={() => setEditDialogOpen(true)}
                >
                    <FaEdit />
                </button>

                <div className="flex justify-center items-center ml-4 pl-4 border-l border-gray-300 cursor-grab">
                    <FaBars />
                </div>
            </div>

            <EditChapterDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                chapter={chapter}
            />
        </div>
    );
}
