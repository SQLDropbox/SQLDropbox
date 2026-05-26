"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaPlus } from "react-icons/fa6";

import Header from "@/components/header";
import AdminCourseDetailsHeader from "@/components/admin/course/adminCourseDetailsHeader";
import SortableChapterList from "@/components/admin/chapter/sortableChapterList";
import EditChapterDialog from "@/components/admin/chapter/editChapterDialog";

import { Course, Chapter } from "@/types/types";
import { courseService } from "@/services/courseService";
import { chapterService } from "@/services/chapterService";

export default function Page() {
    const params = useParams();
    const courseId = params.courseId as string;
    const queryClient = useQueryClient();

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

    const reorderMutation = useMutation({
        mutationFn: (orderedIds: string[]) =>
            chapterService.reorderChapters(courseId, orderedIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["course", courseId] });
        },
        onError: (error) => {
            console.error("Reorder mislukt:", error);
        },
    });

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

    const chapters = course.chapters ?? [];

    return (
        <div>
            <Header />

            <div className="max-w-350 mx-auto p-6">
                <AdminCourseDetailsHeader course={course} />

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

                {chapters.length ? (
                    <SortableChapterList
                        chapters={chapters}
                        onEditChapter={(chapter) => {
                            setSelectedChapter(chapter);
                            setEditDialogOpen(true);
                        }}
                        onReorder={async (orderedIds) => {
                            try {
                                await reorderMutation.mutateAsync(orderedIds);
                            } catch (error) {
                                alert("Kon hoofdstukvolgorde niet opslaan.");
                                throw error;
                            }
                        }}
                    />
                ) : (
                    <p className="text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        Er zijn nog geen hoofdstukken gekoppeld aan dit vak.
                    </p>
                )}
            </div>

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