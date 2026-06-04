"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations, useLocale } from "next-intl";

import Header from "@/components/header";
import { exerciseService } from "@/services/exerciseService";
import { Chapter } from "@/types/types";
import ExerciseSidebar from "@/components/student/exerciseSidebar";
import SchemaTab from "@/components/student/tabs/schemaTab";
import QuestionTab from "@/components/student/tabs/questionTab";
import HistoryTab from "@/components/student/tabs/historyTab";

type PanelTab = "question" | "schema" | "history";
const PANEL_TABS: PanelTab[] = ["question", "schema", "history"];

export default function Page() {
    const t = useTranslations("ChapterExercisePage");
    const locale = useLocale();
    const params = useParams<{ chapterId: string; courseId: string }>();
    const chapterId = params?.chapterId;
    const courseId = params?.courseId;

    const [activeExerciseId, setActiveExerciseId] = useState<number | null>(
        null,
    );
    const [activeTab, setActiveTab] = useState<PanelTab>("question");

    const {
        data: chapter,
        isLoading,
        error,
        refetch,
    } = useQuery<Chapter>({
        queryKey: ["chapter", chapterId],
        queryFn: () =>
            exerciseService.getExercisesByChapterId(chapterId as string),
        enabled: !!chapterId,
    });

    const exercises = chapter?.exercises ?? [];

    const completedExerciseIds = exercises
        .filter((e) => e.userExercises?.[0]?.isCompleted === true)
        .map((e) => e.exerciseId);

    useEffect(() => {
        setActiveExerciseId((current) => {
            if (exercises.length === 0) return null;
            const stillExists = exercises.some((e) => e.exerciseId === current);
            return stillExists ? current : exercises[0].exerciseId;
        });
    }, [exercises]);

    const activeExercise =
        exercises.find((e) => e.exerciseId === activeExerciseId) ??
        exercises[0];

    const question =
        locale === "nl"
            ? (activeExercise?.questionNL ?? activeExercise?.questionEN)
            : (activeExercise?.questionEN ?? activeExercise?.questionNL);

    const chapterName =
        locale === "nl" ? chapter?.chapterNameNL : chapter?.chapterNameEN;

    const activeExerciseIndex = exercises.findIndex((e) => e.exerciseId === activeExercise?.exerciseId,);
    const activeExerciseNumber = activeExerciseIndex >= 0 ? activeExerciseIndex + 1 : null;

    if (!chapterId || !courseId) {
        return (
            <div>
                <Header />
                <p className="mt-6 text-center font-mono text-sm text-error">
                    {t("invalidParams")}
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="bg-surface-2 border-2 border-border px-6 py-5 shadow-[6px_6px_0px_0px_var(--color-border)]">
                        <p className="font-mono text-sm text-error">
                            {t("genericError")}: {(error as Error).message}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <div className="flex flex-1">
                <ExerciseSidebar
                    courseId={courseId}
                    chapterId={chapterId}
                    exercises={exercises}
                    isLoading={isLoading}
                    activeExerciseId={activeExerciseId}
                    setActiveExerciseId={setActiveExerciseId}
                    completedExerciseIds={completedExerciseIds}
                />

                <main className="flex-1 flex flex-col">
                    {isLoading ? (
                        <div className="flex flex-col gap-6 bg-paper bg-ruled p-6 flex-1 animate-pulse">
                            {/* Title */}
                            <div className="h-8 w-64 bg-surface-2 border border-border" />

                            {/* Tab bar */}
                            <div className="flex gap-2 border-b border-border pb-3">
                                <div className="h-8 w-24 bg-surface-2 border border-border" />
                                <div className="h-8 w-20 bg-surface-2 border border-border" />
                                <div className="h-8 w-20 bg-surface-2 border border-border" />
                            </div>

                            {/* Question text */}
                            <div className="space-y-2">
                                <div className="h-30 w-full bg-surface-2 border border-border" />
                            </div>
                        </div>
                    ) : activeExercise ? (
                        <div
                            key={activeExercise.exerciseId}
                            className="flex flex-col gap-6 bg-paper bg-ruled p-6 flex-1 pb-20"
                        >
                            <h1 className="font-display text-2xl font-bold">
                                {chapterName}: Exercise {activeExerciseNumber}
                            </h1>

                            <div className="flex flex-wrap gap-2 border-b border-border pb-3">
                                {PANEL_TABS.map((id) => (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => setActiveTab(id)}
                                        className={`px-4 py-2 border font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${
                                            activeTab === id
                                                ? "bg-paper border-border text-ink"
                                                : "bg-surface-2 border-transparent text-muted hover:border-border hover:text-ink"
                                        }`}
                                    >
                                        {t(`panel.${id}`)}
                                    </button>
                                ))}
                            </div>

                            <div
                                className={
                                    activeTab === "question"
                                        ? "block"
                                        : "hidden"
                                }
                            >
                                <QuestionTab
                                    exercise={activeExercise}
                                    question={question}
                                    schemaName={
                                        chapter?.schema?.schemaName ?? ""
                                    }
                                    chapterId={chapterId}
                                    onUpdate={refetch}
                                />
                            </div>
                            <div
                                className={
                                    activeTab === "schema" ? "block" : "hidden"
                                }
                            >
                                <SchemaTab
                                    schemaName={
                                        chapter?.schema?.schemaName ?? ""
                                    }
                                    schemaImage={
                                        chapter?.schema?.schemaImage ?? null
                                    }
                                />
                            </div>
                            <div
                                className={
                                    activeTab === "history" ? "block" : "hidden"
                                }
                            >
                                <HistoryTab exercise={activeExercise} />
                            </div>
                        </div>
                    ) : (
                        <div className="border border-dashed border-border px-6 py-10 font-mono text-sm text-muted">
                            {t("noExercises")}
                        </div>
                    )}

                    <div className="border-t border-border bg-paper/50 px-8 py-4 flex justify-between items-center">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                            {courseId.toUpperCase()}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                            Chapter ID: {chapterId}
                        </span>
                    </div>
                </main>
            </div>
        </div>
    );
}
