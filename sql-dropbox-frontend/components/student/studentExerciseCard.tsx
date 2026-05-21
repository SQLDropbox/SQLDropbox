"use client";

import { Exercise } from "@/types/types";
import { FaLightbulb } from "react-icons/fa";

interface StudentExerciseCardProps {
    exercise: Exercise;
}

export default function StudentExerciseCard({ exercise }: StudentExerciseCardProps) {
    return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex items-start gap-3">
                <span className="text-xs font-bold bg-white text-gray-600 px-2 py-1 rounded-md border border-gray-200 shrink-0">
                    #{exercise.exerciseId}
                </span>
                <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {exercise.questionNL || "Geen Nederlandse vraag ingevuld."}
                    </h2>

                    {exercise.questionEN && (
                        <p className="mt-1 text-sm text-gray-600">
                            {exercise.questionEN}
                        </p>
                    )}
                </div>
            </div>

            {exercise.hintNL && (
                <div className="mt-4 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 w-fit px-3 py-1.5 rounded-md border border-amber-200">
                    <FaLightbulb className="text-amber-500" />
                    <span>{exercise.hintNL}</span>
                </div>
            )}
        </div>
    );
}