"use client";

import Link from "next/link";
import { FaArrowLeft, FaBookOpen, FaCheck } from "react-icons/fa6";
import { useTranslations } from "next-intl";
import { Exercise } from "@/types/types";
import ProgressIcon from "../admin/chapter/progressIcon";

interface ExerciseSidebarProps {
    courseId: string;
    chapterId: string;
    exercises: Exercise[];
    isLoading?: boolean;
    activeExerciseId: number | null;
    setActiveExerciseId: (id: number) => void;
    completedExerciseIds: number[];
}

export default function ExerciseSidebar({
    courseId,
    chapterId,
    exercises,
    isLoading = false,
    activeExerciseId,
    setActiveExerciseId,
    completedExerciseIds,
}: ExerciseSidebarProps) {
    const t = useTranslations("ChapterExercisePage");

    const totalExercises = exercises.length;
    const completedCount = exercises.filter((e) =>
        completedExerciseIds.includes(e.exerciseId),
    ).length;

    const progressPercentage =
        totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;

    return (
        <aside className="flex flex-col w-72 border-r-2 border-border bg-surface-3 px-6 py-8 gap-6">
            {/* HEADER */}
            <div className="min-h-20">
                <Link
                    href={`/${courseId}`}
                    className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted mb-6"
                >
                    <FaArrowLeft />
                    {t("backToChapters")}
                </Link>

                <div className="font-display flex items-center gap-2 text-xl font-bold text-ink">
                    <FaBookOpen />
                    {courseId.toUpperCase()}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted border-b border-border pb-3 mt-1">
                    Chapter {chapterId}
                </div>
            </div>

            {/* PROGRESS */}
            <div className="border-b border-border pb-4">
                <div className="flex justify-between font-mono text-[12px] uppercase text-muted mb-2 tracking-widest">
                    <span>{t("progressLabel")}</span>
                    <div className="flex items-center gap-2">
                        <span>
                            {isLoading
                                ? "-/-"
                                : `${completedCount}/${totalExercises}`}
                        </span>
                        <ProgressIcon
                            completed={completedCount}
                            total={totalExercises}
                            className="text-[14px]"
                        />
                    </div>
                </div>

                <div className="h-2 border border-border bg-surface-2">
                    <div
                        className="h-full bg-accent"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* EXERCISE LIST */}
            <div className="flex-1 space-y-0 flex flex-col">
                <p className="font-mono text-[12px] uppercase tracking-widest text-muted mb-4">
                    {t("exerciseList")}
                </p>

                {exercises.map((exercise, index) => {
                    const isActive = exercise.exerciseId == activeExerciseId;
                    const isCompleted = completedExerciseIds.includes(
                        exercise.exerciseId,
                    );

                    return (
                        <button
                            key={exercise.exerciseId}
                            onClick={() =>
                                setActiveExerciseId(exercise.exerciseId)
                            }
                            className={`w-full  text-left border px-4 py-4 transition-all relative bg-paper bg-grain ${
                                index !== 0 ? "-mt-px" : ""
                            } ${
                                isActive
                                    ? "border-ink bg-surface-2 rotate-[0.5deg]"
                                    : "border-border hover:border-ink hover:bg-surface-2"
                            }`}
                        >
                            <div className="flex justify-between items-center opacity-80">
                                <span className="font-mono text-xs tracking-widest text-muted">
                                    {String(index + 1).padStart(2, "0")}
                                </span>

                                {isCompleted && (
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
                                        ✓ done
                                    </span>
                                )}
                            </div>

                            <p
                                className={`mt-2 font-display text-sm font-bold leading-snug tracking-wide line-clamp-2 overflow-hidden text-ellipsis ${
                                    isCompleted
                                        ? "text-muted line-through opacity-70"
                                        : "text-ink"
                                }`}
                            >
                                {exercise.questionNL}
                            </p>

                            <div
                                className={`absolute left-0 top-0 bottom-0 w-0.5 ${
                                    isActive ? "bg-ink" : "bg-transparent"
                                }`}
                            />
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}
