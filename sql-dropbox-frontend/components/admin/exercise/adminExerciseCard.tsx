"use client";

import { Exercise } from "@/types/types";
import { FaEdit, FaBars, FaLightbulb } from "react-icons/fa";

interface AdminExerciseCardProps {
    exercise: Exercise;
    onEdit: () => void;
}

export default function AdminExerciseCard({ exercise, onEdit }: AdminExerciseCardProps) {
    return (
        <div className="flex justify-between items-center rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm hover:shadow-lg transition-shadow">
            
            <div className="flex-1 pr-4">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md border border-gray-200">
                        #{exercise.exerciseId}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">
                        {exercise.questionNL || "Geen Nederlandse vraag ingevuld."}
                    </h3>
                </div>

                {exercise.hintNL && (
                    <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 w-fit px-3 py-1.5 rounded-md border border-amber-200">
                        <FaLightbulb className="text-amber-500" />
                        <span>{exercise.hintNL}</span>
                    </div>
                )}
            </div>
            <div className="flex gap-2 items-center">
                <button
                    className="w-10 h-10 flex justify-center items-center border border-gray-300 rounded-lg bg-white hover:bg-gray-100 transition-colors"
                    onClick={onEdit}
                    title="Bewerk oefening"
                >
                    <FaEdit className="text-gray-600" />
                </button>
                <div className="flex justify-center items-center ml-2 pl-4 border-l border-gray-300 text-gray-400 hover:text-gray-600 cursor-grab">
                    <FaBars />
                </div>
            </div>
            
        </div>
    );
}