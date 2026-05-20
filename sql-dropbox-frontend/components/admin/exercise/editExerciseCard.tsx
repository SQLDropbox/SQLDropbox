"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";

import { Exercise } from "@/types/types";
import { exerciseService } from "@/services/exerciseService";
import ConfirmDialog from "@/components/dialog/confirmDialog";

interface Props {
    open: boolean;
    onClose: () => void;
    mode: "add" | "edit";
    chapterId: number;
    exercise?: Exercise;
}

type FormErrors = Partial<Record<keyof Exercise, string>>;

const emptyForm: Partial<Exercise> = {
    questionNL: "",
    questionEN: "",
    hintNL: "",
    hintEN: "",
    queryOutput: "",
    solutionQueries: [""],
};

export default function EditExerciseDialog({
    open,
    onClose,
    mode,
    chapterId,
    exercise,
}: Props) {
    const queryClient = useQueryClient();
    const isEdit = mode === "edit";

    const [form, setForm] = useState<Partial<Exercise>>(emptyForm);
    const [errors, setErrors] = useState<FormErrors>({});
    const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);

    useEffect(() => {
        if (!open) return;

        if (exercise && isEdit) {
            // Zorg ervoor dat er altijd minstens één leeg veld is als er geen oplossingen zijn
            const solutions = exercise.solutionQueries?.length 
                ? exercise.solutionQueries 
                : [""];
            setForm({ ...exercise, solutionQueries: solutions, chapterId });
        } else {
            setForm({ ...emptyForm, chapterId });
        }

        setErrors({});
    }, [open, exercise, isEdit, chapterId]);

    function validate() {
        const newErrors: FormErrors = {};

        if (!form.questionNL?.trim()) newErrors.questionNL = "Nederlandse vraag is verplicht";
        if (!form.questionEN?.trim()) newErrors.questionEN = "Engelse vraag is verplicht";
        
        // Filter lege solutions eruit voordat we valideren/opslaan
        const validSolutions = form.solutionQueries?.filter(q => q.trim() !== "") || [];
        if (validSolutions.length === 0) {
            // We mappen dit error bericht op solutionQueries
            newErrors.solutionQueries = ["Minstens één oplossing is verplicht"] as any;
        }

        return newErrors;
    }

    const mutation = useMutation({
        mutationFn: async () => {
            // Opschonen van lege queries voor het doorsturen
            const cleanedForm = {
                ...form,
                solutionQueries: form.solutionQueries?.filter(q => q.trim() !== "") || []
            };

            if (isEdit && exercise) {
                return exerciseService.updateExercise(exercise.exerciseId, cleanedForm);
            }
            return exerciseService.addExercise(cleanedForm);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["exercises", chapterId], // Pas dit aan naar jouw query key voor oefeningen
            });
            onClose();
        },
    });

    function handleSubmit() {
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        mutation.mutate();
    }

    // Handlers voor dynamische Solutions array
    const updateSolution = (index: number, value: string) => {
        const newSolutions = [...(form.solutionQueries || [])];
        newSolutions[index] = value;
        setForm({ ...form, solutionQueries: newSolutions });
    };

    const addSolution = () => {
        setForm({ ...form, solutionQueries: [...(form.solutionQueries || []), ""] });
    };

    const removeSolution = (index: number) => {
        const newSolutions = [...(form.solutionQueries || [])];
        newSolutions.splice(index, 1);
        setForm({ ...form, solutionQueries: newSolutions });
    };

    if (!open) return null;

    const inputClass = (field: keyof Exercise) =>
        `w-full border rounded-lg px-4 py-2 text-sm ${
            errors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
        }`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl max-h-[90vh] flex flex-col">
                {/* HEADER */}
                <div className="flex justify-between items-start px-6 py-5 border-b shrink-0">
                    <div>
                        <h2 className="text-xl font-semibold">
                            {isEdit ? "Bewerk Oefening" : "Nieuwe Oefening"}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {isEdit ? "Pas de gegevens van de oefening aan." : "Voeg een nieuwe oefening toe aan dit hoofdstuk."}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-black">
                        <FaTimes />
                    </button>
                </div>

                {/* BODY (Scrollable) */}
                <div className="p-6 space-y-6 overflow-y-auto">
                    
                    {/* QUESTIONS */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-900 border-b pb-2">Vragen</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <textarea
                                    placeholder="Vraag (Nederlands)"
                                    rows={3}
                                    value={form.questionNL ?? ""}
                                    onChange={(e) => setForm({ ...form, questionNL: e.target.value })}
                                    className={inputClass("questionNL")}
                                />
                                {errors.questionNL && <p className="text-xs text-red-500 mt-1">{errors.questionNL}</p>}
                            </div>
                            <div>
                                <textarea
                                    placeholder="Question (English)"
                                    rows={3}
                                    value={form.questionEN ?? ""}
                                    onChange={(e) => setForm({ ...form, questionEN: e.target.value })}
                                    className={inputClass("questionEN")}
                                />
                                {errors.questionEN && <p className="text-xs text-red-500 mt-1">{errors.questionEN}</p>}
                            </div>
                        </div>
                    </div>

                    {/* HINTS */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-900 border-b pb-2">Hints</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <textarea
                                placeholder="Hint (Nederlands) - optioneel"
                                rows={2}
                                value={form.hintNL ?? ""}
                                onChange={(e) => setForm({ ...form, hintNL: e.target.value })}
                                className={inputClass("hintNL")}
                            />
                            <textarea
                                placeholder="Hint (English) - optional"
                                rows={2}
                                value={form.hintEN ?? ""}
                                onChange={(e) => setForm({ ...form, hintEN: e.target.value })}
                                className={inputClass("hintEN")}
                            />
                        </div>
                    </div>

                    {/* QUERY OUTPUT */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-900 border-b pb-2">Verwachte Query Output</h3>
                        <textarea
                            placeholder="JSON / CSV weergave van de verwachte output"
                            rows={3}
                            value={form.queryOutput ?? ""}
                            onChange={(e) => setForm({ ...form, queryOutput: e.target.value })}
                            className={`font-mono ${inputClass("queryOutput")}`}
                        />
                    </div>

                    {/* SOLUTIONS */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-900 border-b pb-2">Oplossingen (SQL Queries)</h3>
                        {errors.solutionQueries && (
                            <p className="text-xs text-red-500">{errors.solutionQueries as unknown as string}</p>
                        )}
                        <div className="space-y-3">
                            {form.solutionQueries?.map((sol, index) => (
                                <div key={index} className="flex gap-2 items-start">
                                    <textarea
                                        placeholder={`SELECT * FROM table...`}
                                        rows={2}
                                        value={sol}
                                        onChange={(e) => updateSolution(index, e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm"
                                    />
                                    <button
                                        onClick={() => removeSolution(index)}
                                        className="mt-1 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Verwijder oplossing"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addSolution}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            <FaPlus className="text-xs" /> Extra oplossing toevoegen
                        </button>
                    </div>

                </div>

                {/* FOOTER */}
                <div className="flex justify-between gap-3 px-6 py-4 border-t bg-gray-50 shrink-0 rounded-b-lg">
                    {isEdit && (
                        <button
                            onClick={() => setConfirmDeleteDialogOpen(true)}
                            className="border border-gray-300 px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-400 transition-colors"
                        >
                            Verwijderen
                        </button>
                    )}

                    <div className="flex gap-3 ml-auto">
                        <button
                            onClick={onClose}
                            className="border border-gray-300 bg-white px-4 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                        >
                            Annuleren
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={mutation.isPending}
                            className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                            {mutation.isPending ? "Bezig..." : isEdit ? "Opslaan" : "Aanmaken"}
                        </button>
                    </div>
                </div>

                {/* DELETE CONFIRMATION */}
                <ConfirmDialog
                    open={confirmDeleteDialogOpen}
                    onClose={() => setConfirmDeleteDialogOpen(false)}
                    onConfirm={async () => {
                        if (!exercise) return;
                        await exerciseService.deleteExercise(exercise.exerciseId);
                        queryClient.invalidateQueries({
                            queryKey: ["exercises", chapterId], // Zelfde key als bij onSuccess
                        });
                        setConfirmDeleteDialogOpen(false);
                        onClose();
                    }}
                    title="Oefening Verwijderen"
                    description="Weet je zeker dat je deze oefening wil verwijderen? Alle gerelateerde oplossingen worden ook gewist."
                    type="delete"
                />
            </div>
        </div>
    );
}