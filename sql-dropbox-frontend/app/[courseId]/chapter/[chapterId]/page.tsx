"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import Header from "@/components/header";
import { chapterService } from "@/services/chapterService";
import { exerciseService } from "@/services/exerciseService";
import StudentExerciseWorkspace from "@/components/student/studentExerciseWorkspace";

export default function Page() {
    const params = useParams<{ chapterId: string; courseId: string }>();
    const chapterId = params?.chapterId;
    const courseId = params?.courseId;

    const { data: chapter, isLoading: isChapterLoading, error: chapterError } = useQuery({
        queryKey: ["chapter", chapterId],
        queryFn: () => chapterService.getChapterByChapterId(chapterId as string),
        enabled: !!chapterId,
    });

    const {
        data: exercises = [],
        isLoading: isExercisesLoading,
        error: exercisesError,
    } = useQuery({
        queryKey: ["exercises", chapterId],
        queryFn: () => exerciseService.getExercisesByChapterId(chapterId as string),
        enabled: !!chapterId,
    });

    const isLoading = isChapterLoading || isExercisesLoading;
    const error = chapterError || exercisesError;

    if (!chapterId || !courseId) {
        return (
            <div>
                <Header />
                <div className="max-w-350 mx-auto p-6">
                    <p className="mt-6 text-center text-red-500">Geen geldige URL parameters gevonden.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header />
            <div className="w-full">
                <StudentExerciseWorkspace
                    courseId={courseId}
                    chapterId={chapterId}
                    chapter={chapter}
                    exercises={exercises}
                    isLoading={isLoading}
                    error={error as Error | null}
                    completedExerciseIds={[]}
                />
            </div>
        </div>
    );
}
