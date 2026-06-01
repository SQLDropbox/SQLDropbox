"use client";

import { useEffect, useRef, useState } from "react";
import { FaCircleInfo, FaLightbulb, FaPlay } from "react-icons/fa6";
import { useQueryClient } from "@tanstack/react-query";
import { Chapter, Exercise } from "@/types/types";
import { useTranslations } from "next-intl";
import { queryService } from "@/services/queryService";
import QueryResult from "@/components/student/QueryResult";
import ExerciseSidebar from "@/components/student/exerciseSidebar";
import { exerciseService } from "@/services/exerciseService";
import ExercisePanel from "./exercisePanel";

interface StudentExerciseWorkspaceProps {
    courseId: string;
    chapterId: string;
    chapter?: Chapter;
    exercises: Exercise[];
    isLoading?: boolean;
    error?: Error | null;
    completedExerciseIds?: number[];
}

export default function StudentExerciseWorkspace({
    courseId,
    chapterId,
    chapter,
    exercises,
    isLoading = false,
    error = null,
    completedExerciseIds = [],
}: StudentExerciseWorkspaceProps) {
    const t = useTranslations("ChapterExercisePage");
    const [activeExerciseId, setActiveExerciseId] = useState<number | null>(
        null,
    );

    useEffect(() => {
        setActiveExerciseId((currentActiveId) => {
            if (exercises.length === 0) return null;
            const currentExerciseExists = exercises.some(
                (exercise) => exercise.exerciseId === currentActiveId,
            );
            return currentExerciseExists
                ? currentActiveId
                : exercises[0].exerciseId;
        });
    }, [exercises]);

    const activeExercise =
        exercises.find(
            (exercise) => exercise.exerciseId === activeExerciseId,
        ) || exercises[0];

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6">
                <div className="bg-surface-2 border-2 border-border px-6 py-5 shadow-[6px_6px_0px_0px_var(--color-border)]">
                    <p className="font-mono text-sm text-error">
                        {t("genericError")}: {error.message}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 relative min-h-screen">
            <ExerciseSidebar
                courseId={courseId}
                chapterId={chapterId}
                exercises={exercises}
                isLoading={isLoading}
                activeExerciseId={activeExerciseId}
                setActiveExerciseId={setActiveExerciseId}
                completedExerciseIds={completedExerciseIds}
            />

            <main className="flex-1 flex flex-col bg-surface-2 overflow-y-auto">
                <div className="border-b-2 border-border px-8 py-8 bg-surface-2">
                    <h1 className="font-display text-4xl font-bold mb-2">
                        {chapter?.chapterNameEN ||
                            chapter?.chapterNameNL ||
                            t("chapterFallback", { chapterId })}
                    </h1>
                    <p className="font-mono text-sm text-muted max-w-2xl">
                        {t("pageDescription")}
                    </p>
                </div>

                {/* Exercise panel */}
                <div className="flex-1 px-6 py-8 md:px-10 mx-10">
                    {isLoading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-6 w-48 bg-surface-2 border border-border" />
                            <div className="h-40 w-full bg-surface-2 border border-border" />
                            <div className="h-64 w-full bg-surface-2 border border-border" />
                        </div>
                    ) : activeExercise ? (
                        <ExercisePanel
                            key={activeExercise.exerciseId}
                            exercise={activeExercise}
                            chapterName={
                                chapter?.chapterNameEN ||
                                chapter?.chapterNameNL ||
                                `Chapter ${chapterId}`
                            }
                            schemaName={chapter?.schema?.schemaName || ""}
                            schemaImage={chapter?.schema?.schemaImage || null}
                            chapterId={chapterId}
                        />
                    ) : (
                        <div className="bg-surface-2 border border-dashed border-border px-6 py-10 font-mono text-sm text-muted">
                            {t("noExercises")}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-border bg-surface-2 px-8 py-4 flex justify-between items-center">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                        {courseId?.toUpperCase()}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                        Chapter {chapterId}
                    </span>
                </div>
            </main>
        </div>
    );
}
