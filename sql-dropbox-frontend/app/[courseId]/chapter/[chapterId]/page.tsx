"use client";

import Header from "@/components/header";
import { chapterService } from "@/services/chapterService";
import { exerciseService } from "@/services/exerciseService";
import { Chapter } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import Link from "next/dist/client/link";
import { useParams } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { Exercise } from "@/types/types";

import StudentExerciseCard from "@/components/student/studentExerciseCard";

export default function Page() {
    const params = useParams();

    const chapterId = (params.chapterId as string) ?? undefined;

    const { data: chapter, isLoading: isChapterLoading, error: chapterError } = useQuery<Chapter>({
        queryKey: ["chapter", chapterId],
        queryFn: () => chapterService.getChapterByChapterId(chapterId!),
        enabled: !!chapterId,
    });

    const {
        data: exercises = [],
        isLoading: isExercisesLoading,
        error: exercisesError,
    } = useQuery<Exercise[]>({
        queryKey: ["exercises", chapterId],
        queryFn: () => exerciseService.getExercisesByChapterId(chapterId!),
        enabled: !!chapterId,
    });

    const isLoading = isChapterLoading || isExercisesLoading;
    const error = chapterError || exercisesError;

    return (
        <div>
            <Header />
            <div className="max-w-350 mx-auto p-6">
                <Link
                    href={`/${params.courseId}`}
                    className="flex items-center text-blue-500 hover:text-blue-700 gap-1"
                >
                    <FaArrowLeft />
                    Back to course
                </Link>
                <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-lg flex flex-col gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Oefeningen: {chapter?.chapterNameNL || `Hoofdstuk ${chapterId}`}
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Bekijk hier alle oefeningen binnen dit hoofdstuk.
                        </p>
                    </div>

                    {isLoading ? (
                        <p className="text-gray-500">Gegevens laden...</p>
                    ) : error ? (
                        <p className="text-red-500">Fout: {(error as Error).message}</p>
                    ) : exercises.length === 0 ? (
                        <p className="text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-4">
                            Er zijn nog geen oefeningen gekoppeld aan dit hoofdstuk.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {exercises.map((exercise) => (
                                <StudentExerciseCard
                                    key={exercise.exerciseId}
                                    exercise={exercise}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
