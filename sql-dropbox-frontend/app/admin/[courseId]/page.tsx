"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import Header from "@/components/header";
import AdminCourseDetailsHeader from "@/components/admin/course/adminCourseDetailsHeader";
import AdminChapterCard from "@/components/admin/chapter/adminChapterCard";
import EditChapterDialog from "@/components/admin/chapter/editChapterDialog";

import { Course, Chapter } from "@/types/types";
import { courseService } from "@/services/courseService";

import { FaPlus } from "react-icons/fa6";

export default function Page() {
    const params = useParams();
    const courseId = params.courseId as string;

    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(
        null,
    );

    const {
        data: course,
        isLoading,
        error,
    } = useQuery<Course>({
        queryKey: ["course", courseId],
        queryFn: () => courseService.getCourseByCourseId(courseId),
        enabled: !!courseId,
        retry: false,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />

                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                    <p className="text-sm text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div>
                <Header />
                <div className="max-w-350 mx-auto p-6">
                    <p>Course not found</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header />

            <div className="max-w-350 mx-auto p-6">
                <AdminCourseDetailsHeader course={course} />

                {/* ADD CHAPTER BUTTON */}
                <div className="flex justify-end mb-4">
                    <button
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
                        onClick={() => {
                            setSelectedChapter(null);
                            setEditDialogOpen(true);
                        }}
                    >
                        <FaPlus />
                        New Chapter
                    </button>
                </div>

                {/* CHAPTER LIST (SAFE) */}
                <div className="flex flex-col gap-4">
                    {course.chapters?.map((chapter) => {
                        if (!chapter) return null;

                        return (
                            <AdminChapterCard
                                key={chapter.chapterId}
                                chapter={chapter}
                                onEdit={() => {
                                    setSelectedChapter(chapter);
                                    setEditDialogOpen(true);
                                }}
                            />
                        );
                    })}
                </div>
            </div>

            {/* DIALOG */}
            <EditChapterDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                mode={selectedChapter ? "edit" : "add"}
                chapter={selectedChapter ?? undefined}
                courseId={course.courseId}
            />
        </div>
    );
}
