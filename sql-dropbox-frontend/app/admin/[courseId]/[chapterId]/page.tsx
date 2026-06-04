"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { FaArrowLeft, FaPlus } from "react-icons/fa6";

import Header from "@/components/header";
import AdminExerciseCard from "@/components/admin/exercise/adminExerciseCard";
import { Exercise, Chapter } from "@/types/types";

import { exerciseService } from "@/services/exerciseService";
import { chapterService } from "@/services/chapterService";
import EditExerciseDialog from "@/components/admin/exercise/editExerciseDialog";
import Loading from "@/components/loading";

export default function ChapterExercisesPage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const chapterId = params.chapterId as string;
    const chapterIdNumber = Number(chapterId);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
    const [selectedExercise, setSelectedExercise] = useState<
        Exercise | undefined
    >(undefined);

    const {
        data: chapter,
        isLoading,
        error,
    } = useQuery<Chapter>({
        queryKey: ["exercises", chapterIdNumber],
        queryFn: () => exerciseService.getAllExercisesByChapterId(chapterId),
        enabled: !!chapterId,
    });

    const handleAddExercise = () => {
        setDialogMode("add");
        setSelectedExercise(undefined);
        setIsDialogOpen(true);
    };

    const handleEditExercise = (exercise: Exercise) => {
        setDialogMode("edit");
        setSelectedExercise(exercise);
        setIsDialogOpen(true);
    };

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div>
                <Header />
                <div className="max-w-350 mx-auto p-6">
                    <p className="text-red-500">
                        Fout: {(error as Error).message}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header />

            <div className="max-w-7xl mx-auto p-6">
                <div className="mb-6">
                    <Link
                        href={`/admin/${courseId}`}
                        className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors w-fit text-sm font-medium mb-4"
                    >
                        <FaArrowLeft /> Terug naar hoofdstukken
                    </Link>

                    <h1 className="text-3xl font-bold text-gray-900">
                        Oefeningen:{" "}
                        {chapter?.chapterNameNL || `Hoofdstuk ${chapterId}`}
                    </h1>
                </div>

                <div className="flex justify-end mb-4">
                    <button
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
                        onClick={handleAddExercise}
                    >
                        <FaPlus />
                        New Exercise
                    </button>
                </div>

                {chapter?.exercises?.length === 0 ? (
                    <p className="text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        Er zijn nog geen oefeningen gekoppeld aan dit hoofdstuk.
                    </p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {chapter?.exercises?.map((exercise) => (
                            <AdminExerciseCard
                                key={exercise.exerciseId}
                                exercise={exercise}
                                onEdit={() => handleEditExercise(exercise)}
                            />
                        ))}
                    </div>
                )}
            </div>
            <EditExerciseDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                mode={dialogMode}
                chapterId={chapterIdNumber}
                exercise={selectedExercise}
            />
        </div>
    );
}
