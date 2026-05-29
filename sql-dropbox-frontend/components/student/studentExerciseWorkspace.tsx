"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
    FaArrowLeft,
    FaBookOpen,
    FaCircleInfo,
    FaLightbulb,
    FaPlay,
} from "react-icons/fa6";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Chapter, Course, Exercise } from "@/types/types";
import { courseService } from "@/services/courseService";
import { queryService } from "@/services/queryService";
import QueryResult from "@/components/student/QueryResult";
import ExerciseSidebar from "@/components/student/exerciseSidebar";

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

    const { data: course } = useQuery<Course>({
        queryKey: ["course", courseId],
        queryFn: () => courseService.getCourseByCourseId(courseId),
        enabled: !!courseId,
    });

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

    const totalExercises = exercises.length;
    const completedCount = exercises.filter((exercise) =>
        completedExerciseIds.includes(exercise.exerciseId),
    ).length;

    const progressPercentage =
        totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;

    if (error) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-paper text-ink flex items-center justify-center px-6">
                <div className="bg-surface-2 border-2 border-border px-6 py-5 shadow-[6px_6px_0px_0px_var(--color-border)]">
                    <p className="font-mono text-sm text-error">
                        {t("genericError")}: {error.message}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-paper text-ink px-6 py-8">
            <div className="max-w-7xl mx-auto">
                <Link
                    href={`/${courseId}`}
                    className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted hover:text-ink mb-8"
                >
                    <FaArrowLeft className="text-[12px]" />
                    {t("backToChapters")}
                </Link>

                <div className="relative bg-surface-2 border-2 border-border shadow-[6px_6px_0px_0px_var(--color-border)]">
                    <div className="absolute -top-6 -left-px min-w-[30%] bg-surface-2 px-4 py-1 border border-border border-b-0">
                        <span className="font-mono text-xs uppercase tracking-wider text-muted">
                            {t("idLabel", {
                                courseId: courseId?.toUpperCase(),
                                chapterId,
                            })}
                        </span>
                    </div>

                    <div className="border-b-2 border-border px-8 pt-8 pb-6">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted mb-3">
                                    <FaBookOpen className="text-accent" />
                                    <span>
                                        {course?.courseNameEN ||
                                            course?.courseNameNL ||
                                            t("courseFallback")}
                                    </span>
                                </div>

                                <h1 className="font-display text-4xl font-bold mb-2">
                                    {chapter?.chapterNameEN ||
                                        chapter?.chapterNameNL ||
                                        t("chapterFallback", { chapterId })}
                                </h1>

                                <p className="font-mono text-sm text-muted max-w-2xl">
                                    {t("pageDescription")}
                                </p>
                            </div>

                            <div className="w-full max-w-md border border-border bg-paper px-4 py-4">
                                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                                    <span>{t("progressLabel")}</span>
                                    <span>
                                        {completedCount}/{totalExercises}
                                    </span>
                                </div>

                                <div className="mt-3 h-3 border border-border bg-surface-2">
                                    <div
                                        className="h-full bg-accent transition-all"
                                        style={{
                                            width: `${progressPercentage}%`,
                                        }}
                                    />
                                </div>

                                <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted">
                                    <span>
                                        {t("percentComplete", {
                                            percent:
                                                Math.round(progressPercentage),
                                        })}
                                    </span>
                                    <span>
                                        {t("exercisesCount", {
                                            count: totalExercises,
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid min-h-[70vh] lg:grid-cols-[320px_minmax(0,1fr)]">
                        <aside className="border-r-2 border-border bg-paper">
                            <div className="px-6 pt-6">
                                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-5 border-l-2 border-accent pl-3">
                                    {t("exerciseList")}
                                </p>
                            </div>

                            <div className="px-4 pb-6">
                                <ExerciseSidebar
                                    exercises={exercises}
                                    activeExerciseId={
                                        activeExercise?.exerciseId ?? null
                                    }
                                    completedExerciseIds={completedExerciseIds}
                                    onSelectExercise={setActiveExerciseId}
                                    isLoading={isLoading}
                                />
                            </div>
                        </aside>

                        <section className="min-w-0 bg-surface-2 px-6 py-6 md:px-8">
                            {isLoading ? (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-6 w-48 bg-paper border border-border" />
                                    <div className="h-40 w-full bg-paper border border-border" />
                                    <div className="h-64 w-full bg-paper border border-border" />
                                </div>
                            ) : activeExercise ? (
                                <ExercisePanel
                                    key={activeExercise.exerciseId}
                                    exercise={activeExercise}
                                    chapterName={
                                        chapter?.chapterNameEN ||
                                        chapter?.chapterNameNL ||
                                        t("chapterFallback", { chapterId })
                                    }
                                    schemaName={chapter?.schemaName || ""}
                                    schemaImage={chapter?.schemaImage || null}
                                />
                            ) : (
                                <div className="bg-paper border border-dashed border-border px-6 py-10 font-mono text-sm text-muted">
                                    {t("noExercises")}
                                </div>
                            )}
                        </section>
                    </div>

                    <div className="relative z-20 border-t border-border bg-surface-2 px-8 py-6 flex justify-between items-center">
                        <div className="absolute -top-6 -right-px min-w-[30%] bg-surface-2 px-4 h-8 border border-border border-b-0" />
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                            {courseId?.toUpperCase()}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                            Chapter {chapterId}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

type PanelTab = "question" | "schema" | "output";

const PANEL_TABS: { id: PanelTab; label: string }[] = [
    { id: "question", label: "Question" },
    { id: "schema", label: "Database Schema" },
    { id: "output", label: "Expected Output" },
];

function ExercisePanel({
    exercise,
    chapterName,
    schemaName,
    schemaImage,
}: {
    exercise: Exercise;
    chapterName: string;
    schemaName: string;
    schemaImage?: string | null;
}) {
    const t = useTranslations("ChapterExercisePage");
    const [activeTab, setActiveTab] = useState<PanelTab>("question");
    const [showHint, setShowHint] = useState(false);
    const [queryValue, setQueryValue] = useState("");
    const [queryResult, setQueryResult] = useState<any>(null);
    const imageContainerRef = useRef<HTMLDivElement | null>(null);
    const [scale, setScale] = useState(1);
    const [isHoveringImage, setIsHoveringImage] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [queryError, setQueryError] = useState<string | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);

    const normalizedQuery = queryValue.toLowerCase();

    const requirements = (exercise.requirements ?? []).filter(
        (r) => r.use === true,
    );

    const missingRequirements = requirements.filter(
        (requirement) =>
            !normalizedQuery.includes(requirement.statement.toLowerCase()),
    );

    const queryMeetsRequirements = missingRequirements.length === 0;

    useEffect(() => {
        const el = imageContainerRef.current;
        if (!el) return;

        const handleWheelEvent = (e: WheelEvent) => {
            if (!isHoveringImage) return;
            e.preventDefault();
            const delta = -e.deltaY * 0.0015;
            setScale((prev) => Math.min(Math.max(prev + delta, 0.5), 4));
        };

        el.addEventListener("wheel", handleWheelEvent, { passive: false });
        return () => el.removeEventListener("wheel", handleWheelEvent);
    }, [isHoveringImage]);

    const handleRunQuery = async () => {
        if (!queryValue.trim()) return;

        if (!schemaName) {
            setQueryError(t("noSchemaLinkedError"));
            return;
        }

        if (!queryMeetsRequirements) {
            const list = missingRequirements
                .map((r) => `"${r.statement}"`)
                .join(", ");
            setQueryError(t("missingSyntax", { list }));

            return;
        }

        try {
            setIsExecuting(true);
            setQueryError(null);
            setQueryResult(null);

            const result = await queryService.executeQuery({
                schema: schemaName,
                query: queryValue,
            });

            setQueryResult(result);
        } catch (err) {
            setQueryError(
                err instanceof Error ? err.message : "Something went wrong",
            );
        } finally {
            setIsExecuting(false);
        }
    };

    const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 4));
    const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
    const resetZoom = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2 border-b border-border pb-3">
                {PANEL_TABS.map(({ id, label }) => (
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

            <div className="bg-paper border border-border shadow-[0px_-3px_0px_0px_var(--color-border)] p-6">
                {activeTab === "question" && (
                    <div className="space-y-4">
                        <div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-2">
                                {t("exercisePrompt")}
                            </p>
                            <h3 className="font-display text-2xl font-bold text-ink">
                                {exercise.questionNL ||
                                    t("exerciseQuestionFallback")}
                            </h3>
                        </div>

                        <p className="font-mono text-sm leading-7 text-muted max-w-3xl">
                            {exercise.questionEN || exercise.questionNL}
                        </p>

                        <div className="border border-border bg-surface-2 px-4 py-4">
                            <div className="flex items-start gap-3">
                                <FaCircleInfo className="mt-0.5 text-accent" />
                                <p className="font-mono text-sm text-muted">
                                    {t("hintInstructions")}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "schema" && (
                    <div className="space-y-4">
                        <h3 className="font-display text-2xl font-bold text-ink">
                            {t("panel.schema")}
                        </h3>

                        <div className="border border-border bg-surface-2 p-4">
                            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                                {t("activeSchema")}
                            </p>

                            <code className="mt-3 block border border-border bg-paper px-3 py-2 font-mono text-sm text-ink">
                                {schemaName || t("noSchemaLinked")}
                            </code>

                            {schemaImage ? (
                                <div className="mt-4">
                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                        <button
                                            onClick={zoomIn}
                                            className="border border-border px-3 py-1 font-mono text-xs uppercase tracking-widest text-muted hover:text-ink hover:border-ink"
                                        >
                                            +
                                        </button>
                                        <button
                                            onClick={zoomOut}
                                            className="border border-border px-3 py-1 font-mono text-xs uppercase tracking-widest text-muted hover:text-ink hover:border-ink"
                                        >
                                            -
                                        </button>
                                        <button
                                            onClick={resetZoom}
                                            className="border border-border px-3 py-1 font-mono text-xs uppercase tracking-widest text-muted hover:text-ink hover:border-ink"
                                        >
                                            {t("zoomReset")}
                                        </button>
                                        <span className="ml-2 font-mono text-xs uppercase tracking-widest text-muted">
                                            {Math.round(scale * 100)}%
                                        </span>
                                    </div>

                                    <div
                                        ref={imageContainerRef}
                                        className="relative h-[600px] overflow-hidden border border-border bg-paper touch-none"
                                        style={{
                                            overscrollBehavior: "contain",
                                        }}
                                        onMouseEnter={() =>
                                            setIsHoveringImage(true)
                                        }
                                        onMouseLeave={() =>
                                            setIsHoveringImage(false)
                                        }
                                        onMouseMove={handleMouseMove}
                                        onMouseUp={handleMouseUp}
                                    >
                                        <div
                                            onMouseDown={handleMouseDown}
                                            className="flex h-full w-full cursor-grab items-center justify-center active:cursor-grabbing"
                                        >
                                            <img
                                                src={schemaImage}
                                                alt={`Database schema for ${schemaName}`}
                                                draggable={false}
                                                className="select-none object-contain transition-transform duration-75"
                                                style={{
                                                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                                    maxWidth: "none",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-4 font-mono text-sm text-muted">
                                    {t("noSchemaImage")}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "output" && (
                    <div className="space-y-3">
                        <h3 className="font-display text-2xl font-bold text-ink">
                            {t("panel.output")}
                        </h3>

                        <div className="min-h-40 border border-dashed border-border bg-surface-2 p-4">
                            {exercise.queryOutput ? (
                                <pre className="whitespace-pre-wrap font-mono text-sm leading-6 text-ink">
                                    {exercise.queryOutput}
                                </pre>
                            ) : (
                                <p className="font-mono text-sm text-muted">
                                    {t("noExpectedOutput")}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-paper border border-border p-6 shadow-[0px_-3px_0px_0px_var(--color-border)] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-2">
                            {t("workspaceLabel")}
                        </p>
                        <h3 className="font-display text-2xl font-bold text-ink">
                            {t("yourSqlQuery")}
                        </h3>
                    </div>

                    {exercise.hintNL && (
                        <button
                            type="button"
                            onClick={() => setShowHint((current) => !current)}
                            className="inline-flex items-center gap-2 border-2 border-accent text-accent px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-accent hover:text-paper transition-colors"
                        >
                            <FaLightbulb />
                            {showHint ? t("hideHint") : t("showHint")}
                        </button>
                    )}
                </div>

                {showHint && exercise.hintNL && (
                    <div className="border border-border bg-warning px-4 py-3 font-mono text-sm text-muted">
                        {exercise.hintNL}
                    </div>
                )}

                {requirements.length > 0 && (
                    <div className="border border-border bg-surface-2 px-4 py-4">
                        <div className="flex items-center gap-2 mb-3">
                            <FaCircleInfo className="text-accent text-sm" />

                            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                                {t("requiredSyntax")}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {requirements.map((requirement) => {
                                const isSatisfied = normalizedQuery.includes(
                                    requirement.statement.toLowerCase(),
                                );

                                return (
                                    <div
                                        key={requirement.requirementId}
                                        className={`border px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
                                            isSatisfied
                                                ? "border-accent bg-accent text-paper"
                                                : "border-border bg-paper text-muted"
                                        }`}
                                    >
                                        {isSatisfied ? "✓ " : ""}
                                        {requirement.statement}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <textarea
                    value={queryValue}
                    onChange={(event) => setQueryValue(event.target.value)}
                    placeholder={t("textareaPlaceholder")}
                    rows={12}
                    spellCheck={false}
                    className="min-h-64 w-full border border-border bg-surface-2 px-5 py-4 font-mono text-sm text-ink outline-none transition focus:border-accent"
                />

                <button
                    type="button"
                    onClick={handleRunQuery}
                    disabled={isExecuting || !queryMeetsRequirements}
                    className="inline-flex items-center gap-2 border-2 border-accent text-accent px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-accent hover:text-paper transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <FaPlay />
                    {isExecuting ? t("running") : t("runQuery")}
                </button>

                {queryError && (
                    <div className="border border-error bg-paper px-4 py-3 font-mono text-sm text-error">
                        {queryError}
                    </div>
                )}

                {queryResult && <QueryResult result={queryResult} />}
            </div>
        </div>
    );
}
