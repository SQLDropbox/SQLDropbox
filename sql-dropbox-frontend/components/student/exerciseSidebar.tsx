"use client";

import { FaRegCircle } from "react-icons/fa6";
import { useTranslations } from "next-intl";
import { Exercise } from "@/types/types";

function LoadingSkeleton() {
    return (
        <div className="w-full border border-border bg-paper bg-ruled px-4 py-4 animate-pulse">
            <div className="flex items-start gap-4">
                <div className="h-4 w-8 bg-surface-2 border border-border" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-surface-2 border border-border" />
                    <div className="h-4 w-40 bg-surface-2 border border-border" />
                </div>
                <div className="h-5 w-10 bg-surface-2 border border-border" />
            </div>
        </div>
    );
}

interface ExerciseSidebarProps {
    exercises: Exercise[];
    activeExerciseId: number | null;
    completedExerciseIds: number[];
    onSelectExercise: (exerciseId: number) => void;
    isLoading?: boolean;
}

export default function ExerciseSidebar({
    exercises,
    activeExerciseId,
    completedExerciseIds,
    onSelectExercise,
    isLoading = false,
}: ExerciseSidebarProps) {
    const t = useTranslations("ExerciseSidebar");

    return (
        <aside className="flex min-h-0 flex-col bg-paper">
            <div className="border-b border-border px-5 py-4">
                <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                    {t("title")}
                </h2>
            </div>

            <div className="flex-1 min-h-0 space-y-0 overflow-y-auto px-4 py-4">
                {isLoading
                    ? Array.from({ length: 6 }).map((_, index) => (
                          <div
                              key={index}
                              className={index === 0 ? "" : "-mt-px"}
                          >
                              <LoadingSkeleton />
                          </div>
                      ))
                    : exercises.map((exercise, index) => {
                          const isActive =
                              exercise.exerciseId === activeExerciseId;
                          const isCompleted = completedExerciseIds.includes(
                              exercise.exerciseId,
                          );

                          return (
                              <button
                                  key={exercise.exerciseId}
                                  type="button"
                                  onClick={() =>
                                      onSelectExercise(exercise.exerciseId)
                                  }
                                  className={`relative w-full text-left border px-4 py-4 bg-paper bg-ruled transition-all ${
                                      index === 0 ? "" : "-mt-px"
                                  } ${
                                      isActive
                                          ? "z-10 border-accent shadow-[0px_-3px_0px_0px_var(--color-accent)]"
                                          : "border-border hover:z-10 hover:border-ink hover:shadow-[0px_-3px_0px_0px_var(--color-border)]"
                                  }`}
                              >
                                  <div className="flex items-start gap-4">
                                      <span className="w-8 shrink-0 pt-0.5 font-mono text-xs text-muted">
                                          {String(index + 1).padStart(2, "0")}
                                      </span>

                                      <div className="min-w-0 flex-1">
                                          <div className="flex items-start justify-between gap-3">
                                              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                                                  {t("exerciseLabel", {
                                                      number: index + 1,
                                                  })}
                                              </span>

                                              {isCompleted ? (
                                                  <span className="border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted">
                                                      {t("done")}
                                                  </span>
                                              ) : (
                                                  <FaRegCircle className="mt-0.5 text-muted text-xs" />
                                              )}
                                          </div>

                                          <p
                                              className={`mt-2 font-display text-base font-bold leading-snug ${
                                                  isCompleted
                                                      ? "text-muted line-through"
                                                      : "text-ink"
                                              }`}
                                          >
                                              {exercise.questionNL ||
                                                  t("untitled")}
                                          </p>
                                      </div>
                                  </div>
                              </button>
                          );
                      })}
            </div>
        </aside>
    );
}