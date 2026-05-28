"use client";

import { Exercise } from "@/types/types";
import { FaLightbulb } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";
import { useTranslations, useLocale } from "next-intl";

interface AdminExerciseCardProps {
    exercise: Exercise;
    onEdit: () => void;
}

export default function AdminExerciseCard({
    exercise,
    onEdit,
}: AdminExerciseCardProps) {
    const t = useTranslations("ExerciseCard");
    const locale = useLocale();

    const question =
        locale === "nl"
            ? exercise.questionNL ?? exercise.questionEN
            : exercise.questionEN ?? exercise.questionNL;

    const hint =
        locale === "nl"
            ? exercise.hintNL ?? exercise.hintEN
            : exercise.hintEN ?? exercise.hintNL;

    return (
        <div
            className="
                relative flex justify-between items-start gap-4
                border border-border bg-paper bg-ruled
                px-6 py-5
                shadow-[0px_-3px_0px_0px_var(--color-border)]
                hover:border-accent hover:shadow-[0px_-3px_0px_0px_var(--color-accent)]
                transition-all
            "
        >
            <div className="flex-1 min-w-0 pr-2">
                <div className="flex flex-wrap items-start gap-3 mb-3">
                    <span className="border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted">
                        #{exercise.exerciseId}
                    </span>

                    <div className="min-w-0 flex-1">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-1">
                            Exercise record
                        </p>

                        <h3 className="font-display text-xl font-bold text-ink leading-tight">
                            {question || t("noQuestion")}
                        </h3>
                    </div>
                </div>

                {hint && (
                    <div className="border border-border bg-surface-2 px-3 py-3 max-w-2xl">
                        <div className="flex items-start gap-2">
                            <FaLightbulb className="mt-0.5 text-accent shrink-0" />
                            <div className="min-w-0">
                                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-1">
                                    Hint
                                </p>
                                <p className="font-mono text-sm text-muted leading-6 line-clamp-2">
                                    {hint}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex shrink-0 items-start">
                <button
                    className="
                        flex h-10 w-10 items-center justify-center
                        border-2 border-accent text-accent
                        hover:bg-accent hover:text-paper
                        transition-colors rotate-1
                    "
                    onClick={onEdit}
                    title={t("edit")}
                    type="button"
                >
                    <FiEdit2 className="text-[15px]" />
                </button>
            </div>
        </div>
    );
}