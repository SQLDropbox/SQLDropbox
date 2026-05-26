"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    FaArrowLeft,
    FaBookOpen,
    FaCircleInfo,
    FaLightbulb,
    FaPlay,
} from "react-icons/fa6";
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
    const [activeExerciseId, setActiveExerciseId] = useState<number | null>(null);

    const { data: course } = useQuery<Course>({
        queryKey: ["course", courseId],
        queryFn: () => courseService.getCourseByCourseId(courseId),
        enabled: !!courseId,
    });

    useEffect(() => {
        setActiveExerciseId((currentActiveId) => {
            if (exercises.length === 0) {
                return null;
            }

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
        totalExercises > 0
            ? (completedCount / totalExercises) * 100
            : 0;

    if (error) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center bg-white p-6">
                <p className="text-red-500">Fout: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-auto bg-white">
            <div className="border-b border-gray-200 px-6 py-5 sm:px-8">
                <Link
                    href={`/${courseId}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-sky-600 transition-colors hover:text-sky-700"
                >
                    <FaArrowLeft />
                    Back to chapters
                </Link>

                <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                            <FaBookOpen className="text-sky-600" />
                            <span>
                                {course?.courseNameEN ||
                                    course?.courseNameNL ||
                                    "Course"}
                            </span>
                        </div>

                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                            {chapter?.chapterNameEN ||
                                chapter?.chapterNameNL ||
                                `Chapter ${chapterId}`}
                        </h1>
                    </div>

                    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                            <span>Progress</span>
                            <span>
                                {completedCount}/{totalExercises} completed
                            </span>
                        </div>

                        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
                            <div
                                className="h-full rounded-full bg-linear-to-r from-slate-950 to-sky-600 transition-all"
                                style={{
                                    width: `${progressPercentage}%`,
                                }}
                            />
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                            <span>
                                {Math.round(progressPercentage)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid flex-1 min-h-0 gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
                <ExerciseSidebar
                    exercises={exercises}
                    activeExerciseId={activeExercise?.exerciseId ?? null}
                    completedExerciseIds={completedExerciseIds}
                    onSelectExercise={setActiveExerciseId}
                    isLoading={isLoading}
                />

                <section className="min-w-0 bg-white px-5 py-6 sm:px-8">
                    {isLoading ? (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="h-6 w-56 rounded bg-slate-100 animate-pulse" />
                                <div className="h-4 w-40 rounded bg-slate-100 animate-pulse" />
                            </div>

                            <div className="rounded-3xl border border-gray-200 bg-[#f6f6f8] p-5 shadow-inner sm:p-6">
                                <div className="space-y-4">
                                    <div className="h-4 w-64 rounded bg-slate-100 animate-pulse" />
                                    <div className="h-3 w-80 rounded bg-slate-100 animate-pulse" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="h-5 w-40 rounded bg-slate-100 animate-pulse" />
                                    <div className="h-8 w-24 rounded bg-slate-100 animate-pulse" />
                                </div>

                                <div className="h-48 w-full rounded bg-slate-100 animate-pulse" />

                                <div className="flex flex-wrap gap-3">
                                    <div className="h-10 w-24 rounded bg-slate-100 animate-pulse" />
                                </div>
                            </div>
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
                            schemaName={chapter?.schemaName || ""}
                            schemaImage={chapter?.schemaImage || null}
                        />
                    ) : (
                        <div className="flex min-h-112 items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-slate-50 p-6 text-sm text-slate-500">
                            No exercises found for this chapter.
                        </div>
                    )}
                </section>
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
    const [activeTab, setActiveTab] =
        useState<PanelTab>("question");

    const [showHint, setShowHint] = useState(false);

    const [queryValue, setQueryValue] = useState("");

    const [queryResult, setQueryResult] = useState<any>(null);

    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const [queryError, setQueryError] = useState<string | null>(null);

    const [isExecuting, setIsExecuting] = useState(false);

    const handleRunQuery = async () => {
        if (!queryValue.trim()) return;

        if (!schemaName) {
            setQueryError("No database schema is linked to this chapter.");
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
                err instanceof Error
                    ? err.message
                    : "Something went wrong",
            );
        } finally {
            setIsExecuting(false);
        }
    };

    const zoomIn = () => {
        setScale((prev) => Math.min(prev + 0.2, 4));
    };
    
    const zoomOut = () => {
        setScale((prev) => Math.max(prev - 0.2, 0.5));
    };
    
    const resetZoom = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };
    
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        
        const delta = -e.deltaY * 0.0015;
        
        setScale((prev) => {
            const next = prev + delta;
        
            return Math.min(Math.max(next, 0.5), 4);
        });
    };
    
    const handleMouseDown = (
        e: React.MouseEvent<HTMLDivElement>,
    ) => {
        setIsDragging(true);
    
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };
    
    const handleMouseMove = (
        e: React.MouseEvent<HTMLDivElement>,
    ) => {
        if (!isDragging) return;
    
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };
    
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-wrap gap-2 rounded-2xl border border-gray-200 bg-slate-50 p-2">
                {PANEL_TABS.map(({ id, label }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setActiveTab(id)}
                        className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === id
                                ? "bg-white text-slate-950 shadow-sm"
                                : "text-slate-500 hover:text-slate-900"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="min-h-48 rounded-3xl border border-gray-200 bg-[#f6f6f8] p-5 shadow-inner sm:p-6">
                {activeTab === "question" && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900">
                            {exercise.questionNL || "Exercise question"}
                        </h3>

                        <p className="max-w-3xl text-sm leading-6 text-slate-600">
                            {exercise.questionEN ||
                                exercise.questionNL}
                        </p>

                        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
                            <div className="flex items-start gap-2">
                                <FaCircleInfo className="mt-0.5 text-sky-600" />

                                <p>
                                    Write your SQL query below.
                                    Use the hint if you need help,
                                    then run the query to validate
                                    your answer.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "schema" && (
                    <div className="space-y-4 text-sm text-slate-700">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Database Schema
                        </h3>
                                
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4">
                            <p className="text-sm text-slate-500">Active schema:</p>
                                
                            <code className="mt-2 block rounded bg-slate-100 px-3 py-2 text-sm">
                                {schemaName || "No schema linked"}
                            </code>
                                
                            {schemaImage ? (
                                <div className="mt-4">
                                    <div className="mb-3 flex items-center gap-2">
                                        <button
                                            onClick={zoomIn}
                                            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-100"
                                        >
                                            +
                                        </button>

                                        <button
                                            onClick={zoomOut}
                                            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-100"
                                        >
                                            -
                                        </button>

                                        <button
                                            onClick={resetZoom}
                                            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-100"
                                        >
                                            Reset
                                        </button>

                                        <span className="ml-2 text-sm text-slate-500">
                                            {Math.round(scale * 100)}%
                                        </span>
                                    </div>

                                    <div
                                        className="relative h-[600px] overflow-hidden rounded-2xl border border-slate-300 bg-slate-100 touch-none" style={{ overscrollBehavior: "contain", }}
                                            
                                        onWheel={handleWheel}
                                        onMouseMove={handleMouseMove}
                                        onMouseUp={handleMouseUp}
                                        onMouseLeave={handleMouseUp}
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
                                <p className="mt-4 text-sm text-slate-500">
                                    No schema image is available for this chapter yet.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "output" && (
                    <div className="space-y-3 text-sm text-slate-700">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Expected Output
                        </h3>

                        <div className="min-h-40 rounded-2xl border border-dashed border-slate-300 bg-white p-4">
                            {exercise.queryOutput ? (
                                <pre className="whitespace-pre-wrap font-mono text-sm leading-6 text-slate-800">
                                    {exercise.queryOutput}
                                </pre>
                            ) : (
                                <p className="text-sm text-slate-500">
                                    No expected output is available
                                    for this exercise yet.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">
                        Your SQL Query
                    </h3>

                    {exercise.hintNL && (
                        <button
                            type="button"
                            onClick={() =>
                                setShowHint((current) => !current)
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100"
                        >
                            <FaLightbulb className="text-amber-500" />

                            {showHint
                                ? "Hide Hint"
                                : "Show Hint"}
                        </button>
                    )}
                </div>

                {showHint && exercise.hintNL && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 animate-in fade-in zoom-in-95">
                        {exercise.hintNL}
                    </div>
                )}

                <textarea
                    value={queryValue}
                    onChange={(event) =>
                        setQueryValue(event.target.value)
                    }
                    placeholder="SELECT * FROM ..."
                    rows={12}
                    spellCheck={false}
                    className="min-h-64 w-full rounded-3xl border border-gray-200 bg-[#f3f3f5] px-5 py-4 font-mono text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                />

                <button
                    type="button"
                    onClick={handleRunQuery}
                    disabled={isExecuting}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:opacity-50"
                >
                    <FaPlay />
                    {isExecuting ? "Running..." : "Run Query"}
                </button>

                {queryError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {queryError}
                    </div>
                )}

                {queryResult && (
                    <QueryResult result={queryResult} />
                )}
            </div>
        </div>
    );
}