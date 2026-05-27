"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaPlus } from "react-icons/fa6";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";

import Header from "@/components/header";
import ChapterCard from "@/components/admin/chapter/chapterCard";
import EditChapterDialog from "@/components/admin/chapter/editChapterDialog";

import { Course, Chapter } from "@/types/types";
import { courseService } from "@/services/courseService";
import { chapterService } from "@/services/chapterService";
import Loading from "@/components/loading";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
    restrictToVerticalAxis,
    restrictToWindowEdges,
} from "@dnd-kit/modifiers";

export default function Page() {
    const params = useParams();
    const courseId = params.courseId as string;
    const locale = useLocale();
    const t = useTranslations("Course");
    const queryClient = useQueryClient();

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(
        null,
    );

    const reorderMutation = useMutation({
        mutationFn: (orderedIds: string[]) =>
            chapterService.reorderChapters(courseId, orderedIds),
        onSuccess: () => {
            //queryClient.invalidateQueries({ queryKey: ["course", courseId] });
        },
    });

    const { data, isLoading, error } = useQuery<Course>({
        queryKey: ["course", courseId],
        queryFn: () => courseService.getCourseByCourseId(courseId),
        enabled: !!courseId,
        retry: false,
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        }),
    );
    if (error) notFound();
    if (isLoading) return <Loading />;

    const courseName =
        locale === "en" ? data?.courseNameEN : data?.courseNameNL;
    const courseDesc =
        locale === "en" ? data?.courseDescriptionEN : data?.courseDescriptionNL;
    const chapters: Chapter[] = (data?.chapters ?? []).sort(
        (a, b) => a.order! - b.order!,
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = chapters.findIndex(
            (c) => String(c.chapterId) === active.id,
        );
        const newIndex = chapters.findIndex(
            (c) => String(c.chapterId) === over.id,
        );
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(chapters, oldIndex, newIndex);

        queryClient.setQueryData<Course>(["course", courseId], (old) =>
            old ? { ...old, chapters: reordered } : old,
        );

        reorderMutation.mutate(reordered.map((c) => String(c.chapterId)));
    }

    return (
        <div className="bg-paper text-ink min-h-screen flex flex-col">
            <Header />

            <main className="grow max-w-7xl mx-auto w-full px-6 py-12">
                <div className="flex items-center justify-between mb-10">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted hover:text-ink"
                    >
                        ← {t("backToCourses")}
                    </Link>

                    <button
                        onClick={() => {
                            setSelectedChapter(null);
                            setEditDialogOpen(true);
                        }}
                        className="
                            inline-flex items-center gap-2
                            bg-ink text-paper
                            font-mono text-[10px] uppercase tracking-widest
                            px-4 py-2.5
                            border-2 border-border
                            shadow-[3px_3px_0px_0px_var(--color-border)]
                            hover:shadow-[1px_1px_0px_0px_var(--color-border)]
                            hover:translate-x-[2px] hover:translate-y-[2px]
                            transition-all duration-100
                        "
                    >
                        <FaPlus className="w-2.5 h-2.5" />
                        {t("newChapter") ?? "New Chapter"}
                    </button>
                </div>

                <div className="relative z-10 bg-surface-2 border-2 border-border shadow-[6px_6px_0px_0px_var(--color-border)]">
                    {/* Top tab */}
                    <div className="absolute -top-6 -left-px min-w-[30%] bg-surface-2 px-4 py-1 border border-border border-b-0">
                        <span className="font-mono text-xs uppercase tracking-wider text-muted">
                            ID: {courseId?.toUpperCase() ?? "—"}
                        </span>
                    </div>

                    {/* Course header */}
                    <div className="border-b-2 border-border px-8 pt-8 pb-6">
                        <h1 className="font-display text-4xl font-bold mb-3">
                            {courseName}
                        </h1>
                        <p className="font-mono text-sm text-muted max-w-2xl">
                            {courseDesc}
                        </p>
                    </div>

                    {/* Chapters */}
                    <div className="px-8 pt-8 -mb-10">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-6 border-l-2 border-accent pl-3">
                            {t("chaptersLabel") ?? "Chapters"}
                        </p>

                        {chapters.length === 0 ? (
                            <div className="relative">
                                <div className="relative bg-ruled bg-paper border border-border px-6 shadow-[0px_-3px_0px_0px_var(--color-border)] h-40 flex items-center justify-center pb-8">
                                    <p className="font-mono text-sm text-muted text-center max-w-md">
                                        {t("noChapters")}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                    modifiers={[
                                        restrictToVerticalAxis,
                                        restrictToWindowEdges,
                                    ]}
                                >
                                    <SortableContext
                                        items={chapters.map((c) =>
                                            String(c.chapterId),
                                        )}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {chapters.map((chapter, index) => (
                                            <ChapterCard
                                                key={chapter.chapterId}
                                                chapter={chapter}
                                                index={index}
                                                courseId={courseId}
                                                adminMode
                                                onEdit={(chapter) => {
                                                    setSelectedChapter(chapter);
                                                    setEditDialogOpen(true);
                                                }}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="relative z-20 border-t border-border bg-surface-2 px-8 py-6 flex justify-between items-center">
                        {/* Bottom-right tab */}
                        <div className="absolute -top-6 -right-px min-w-[30%] bg-surface-2 px-4 h-8 border border-border border-b-0" />

                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                            {courseId?.toUpperCase()}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                            {data?.lecturer}
                        </span>
                    </div>
                </div>
            </main>

            <EditChapterDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                mode={selectedChapter ? "edit" : "add"}
                chapter={selectedChapter ?? undefined}
                courseId={courseId}
            />
        </div>
    );
}
