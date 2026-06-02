"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import Header from "@/components/header";
import { exerciseService } from "@/services/exerciseService";
import StudentExerciseWorkspace from "@/components/student/studentExerciseWorkspace";
import { Chapter } from "@/types/types";

export default function Page() {
    const t = useTranslations("ChapterExercisePage");
    const params = useParams<{ chapterId: string; courseId: string }>();
    const chapterId = params?.chapterId;
    const courseId = params?.courseId;

    const {
        data: chapter,
        isLoading,
        error: chapterError,
        refetch,
    } = useQuery<Chapter>({
        queryKey: ["chapter", chapterId],
        queryFn: () =>
            exerciseService.getExercisesByChapterId(chapterId as string),
        enabled: !!chapterId,
    });

    const error = chapterError;

    const completedExerciseIds =
        chapter?.exercises
            ?.filter(
                (exercise) => exercise.userExercises?.[0]?.isCompleted === true,
            )
            .map((exercise) => exercise.exerciseId) ?? [];

    console.log("Completed Exercise IDs:", completedExerciseIds);

    if (!chapterId || !courseId) {
        return (
            <div>
                <Header />
                <div className="max-w-350 mx-auto p-6">
                    <p className="mt-6 text-center text-red-500">
                        {t("invalidParams")}
                    </p>
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
                    exercises={chapter?.exercises ?? []}
                    isLoading={isLoading}
                    error={error as Error | null}
                    completedExerciseIds={completedExerciseIds}
                    onUpdate={() => {
                        console.log("Exercise updated, refetching chapter...");
                        refetch();
                    }}
                />
            </div>
        </div>
    );
}
