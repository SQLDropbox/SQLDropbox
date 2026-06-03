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

                <main className="flex-1 flex flex-col overflow-y-auto bg-surface-2">
                    <div className="border-b-2 border-border px-8 py-8 bg-surface-2">
                        <h1 className="font-display text-4xl font-bold mb-2">
                            {chapter?.chapterNameEN ??
                                chapter?.chapterNameNL ??
                                t("chapterFallback", { chapterId })}
                        </h1>
                        <p className="font-mono text-sm text-muted max-w-2xl">
                            {t("pageDescription")}
                        </p>
                    </div>

                    <div className="flex-1 px-6 py-8 md:px-10 mx-10">
                        {isLoading ? (
                            <div className="space-y-4 animate-pulse">
                                <div className="h-6 w-48 bg-surface-2 border border-border" />
                                <div className="h-40 w-full bg-surface-2 border border-border" />
                                <div className="h-64 w-full bg-surface-2 border border-border" />
                            </div>
                        ) : activeExercise ? (
                            <div
                                key={activeExercise.exerciseId}
                                className="space-y-6 bg-paper bg-ruled p-6"
                            >
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

                                <div>
                                    {activeTab === "question" && (
                                        <QuestionTab
                                            exercise={activeExercise}
                                            question={question}
                                            schemaName={
                                                chapter?.schema?.schemaName ??
                                                ""
                                            }
                                            chapterId={chapterId}
                                            onUpdate={refetch}
                                        />
                                    )}
                                    {activeTab === "schema" && (
                                        <SchemaTab
                                            schemaName={
                                                chapter?.schema?.schemaName ??
                                                ""
                                            }
                                            schemaImage={
                                                chapter?.schema?.schemaImage ??
                                                null
                                            }
                                        />
                                    )}
                                    {activeTab === "history" && <HistoryTab />}
                                </div>
                            </div>
                        ) : (
                            <div className="border border-dashed border-border px-6 py-10 font-mono text-sm text-muted">
                                {t("noExercises")}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-border bg-surface-2 px-8 py-4 flex justify-between items-center">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                            {courseId.toUpperCase()}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                            Chapter {chapterId}
                        </span>
                    </div>
                </main>
            </div>
        </div>
    );
}
