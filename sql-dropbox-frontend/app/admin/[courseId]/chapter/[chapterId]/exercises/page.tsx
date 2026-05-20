"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { FaArrowLeft, FaPlus } from "react-icons/fa6";

import Header from "@/components/header";
import AdminExerciseCard from "@/components/admin/exercise/adminExerciseCard"; 
import { Exercise, Chapter } from "@/types/types";

import { exerciseService } from "@/services/exerciseService";
import { chapterService } from "@/services/chapterService";

export default function ChapterExercisesPage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const chapterId = params.chapterId as string;

    const { data: chapter } = useQuery<Chapter>({
        queryKey: ["chapter", chapterId],
        queryFn: () => chapterService.getChapterByChapterId(chapterId),
        enabled: !!chapterId,
    });

    const {
        data: exercises = [], 
        isLoading,
        error,
    } = useQuery<Exercise[]>({
        queryKey: ["exercises", chapterId],
        queryFn: () => exerciseService.getExercisesByChapterId(chapterId),
        enabled: !!chapterId,
    });

    const handleEditExercise = (exerciseId: number) => {
        console.log(`Bewerk oefening met ID: ${exerciseId}`);
    };

    if (isLoading) {
        return (
            <div>
                <Header />
                <div className="max-w-350 mx-auto p-6">
                    <p className="text-gray-500">Gegevens laden...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Header />
                <div className="max-w-350 mx-auto p-6">
                    <p className="text-red-500">Fout: {(error as Error).message}</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header />

            <div className="max-w-350 mx-auto p-6">
                
                <div className="mb-6">
                    <Link 
                        href={`/admin/${courseId}`} 
                        className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors w-fit text-sm font-medium mb-4"
                    >
                        <FaArrowLeft /> Terug naar hoofdstukken
                    </Link>
                    
                    <h1 className="text-3xl font-bold text-gray-900">
                        Oefeningen: {chapter?.chapterNameNL || `Hoofdstuk ${chapterId}`}
                    </h1>
                </div>

                <div className="flex justify-end mb-4">
                    <button
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
                        onClick={() => {
                            console.log("Nieuwe oefening modal openen");
                        }}
                    >
                        <FaPlus />
                        New Exercise
                    </button>
                </div>

                {exercises.length === 0 ? (
                    <p className="text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        Er zijn nog geen oefeningen gekoppeld aan dit hoofdstuk.
                    </p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {exercises.map((exercise) => (
                            <AdminExerciseCard 
                                key={exercise.exerciseId} 
                                exercise={exercise} 
                                onEdit={() => handleEditExercise(exercise.exerciseId)} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}