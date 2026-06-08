"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { FaArrowLeft, FaPlus } from "react-icons/fa6";
import { useLocale, useTranslations } from "next-intl";

import Header from "@/components/header";
import AdminExerciseCard from "@/components/admin/exercise/adminExerciseCard";
import { Exercise, Chapter } from "@/types/types";

import { exerciseService } from "@/services/exerciseService";
import { chapterService } from "@/services/chapterService";
import EditExerciseDialog from "@/components/admin/exercise/editExerciseDialog";
import Loading from "@/components/loading";

export default function ChapterExercisesPage() {
    const t = useTranslations("AdminChapterExercisesPage");
    const locale = useLocale();
    const params = useParams();
    const courseId = params.courseId as string;
    const chapterId = params.chapterId as string;
    const chapterIdNumber = Number(chapterId);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
    const [selectedExercise, setSelectedExercise] = useState<
        Exercise | undefined
    >(undefined);

    const {
        data: chapter,
        isLoading,
        error,
        refetch,
    } = useQuery<Chapter>({
        queryKey: ["exercises", chapterIdNumber],
        queryFn: () => exerciseService.getAllExercisesByChapterId(chapterId),
        enabled: !!chapterId,
    });

    const handleAddExercise = () => {
        setDialogMode("add");
        setSelectedExercise(undefined);
        setIsDialogOpen(true);
    };

    const handleEditExercise = (exercise: Exercise) => {
        setDialogMode("edit");
        setSelectedExercise(exercise);
        setIsDialogOpen(true);
    };

    const chapterName =
        locale === "nl"
            ? chapter?.chapterNameNL ?? chapter?.chapterNameEN
            : chapter?.chapterNameEN ?? chapter?.chapterNameNL;

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div>
                <Header />
                <div className="max-w-350 mx-auto p-6">
                    <p className="text-red-500">{t("error", { message: (error as Error).message })}</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header />

            <div className="max-w-7xl mx-auto p-6">
                <div className="mb-6">
                    <Link
                        href={`/admin/${courseId}`}
                        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted hover:text-ink"
                    >
                        ← {t("backToChapters")}
                    </Link>

                    <h1 className="font-display text-4xl font-bold mb-3">
                        {t("title", {
                            chapterName:
                                chapterName ?? t("chapterFallback", { chapterId }),
                        })}
                    </h1>
                </div>

                <div className="flex justify-end mb-4">
                    <button
                        className="flex items-center gap-2 font-mono text-sm border-2 px-4 py-2 uppercase tracking-widest transition-colors -rotate-1 border-accent text-accent hover:bg-accent hover:text-paper"
                        onClick={handleAddExercise}
                    >
                        <FaPlus className="w-2.5 h-2.5" />
                        {t("addExercise")}
                    </button>
                </div>

                {chapter?.exercises?.length === 0 ? (
                    <p className="text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        {t("empty")}
                    </p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {chapter?.exercises?.map((exercise) => (
                            <AdminExerciseCard
                                key={exercise.exerciseId}
                                exercise={exercise}
                                onEdit={() => handleEditExercise(exercise)}
                            />
                        ))}
                    </div>
                )}
            </div>
            <EditExerciseDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                mode={dialogMode}
                exercise={selectedExercise}
                onSuccess={refetch}
            />
        </div>
    );
}
