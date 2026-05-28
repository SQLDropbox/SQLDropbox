"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaTimes, FaPlus } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { useTranslations } from "next-intl";

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
    const t = useTranslations("EditExerciseDialog");

    const [form, setForm] = useState<Partial<Exercise>>(emptyForm);
    const [errors, setErrors] = useState<FormErrors>({});
    const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);

    useEffect(() => {
        if (!open) return;

        if (exercise && isEdit) {
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

        if (!form.questionNL?.trim()) {
            newErrors.questionNL = t("errors.questionNLRequired");
        }
        if (!form.questionEN?.trim()) {
            newErrors.questionEN = t("errors.questionENRequired");
        }

        const validSolutions =
            form.solutionQueries?.filter((q) => q.trim() !== "") || [];

        if (validSolutions.length === 0) {
            newErrors.solutionQueries = [t("errors.atLeastOneSolution")] as any;
        }

        return newErrors;
    }

    const mutation = useMutation({
        mutationFn: async () => {
            const cleanedForm = {
                ...form,
                solutionQueries:
                    form.solutionQueries?.filter((q) => q.trim() !== "") || [],
            };

            if (isEdit && exercise) {
                return exerciseService.updateExercise(
                    exercise.exerciseId,
                    cleanedForm,
                );
            }

            return exerciseService.addExercise(cleanedForm);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["exercises", chapterId],
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

    const updateSolution = (index: number, value: string) => {
        const newSolutions = [...(form.solutionQueries || [])];
        newSolutions[index] = value;
        setForm({ ...form, solutionQueries: newSolutions });
    };

    const addSolution = () => {
        setForm({
            ...form,
            solutionQueries: [...(form.solutionQueries || []), ""],
        });
    };

    const removeSolution = (index: number) => {
        const newSolutions = [...(form.solutionQueries || [])];
        newSolutions.splice(index, 1);
        setForm({ ...form, solutionQueries: newSolutions });
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="relative w-full max-w-6xl max-h-[90vh] bg-paper-light text-ink border border-border shadow-2xl flex flex-col font-mono">
                <div className="border-b border-border bg-paper px-6 py-4 flex justify-between items-start shrink-0">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted">
                            EXERCISE DOSSIER / SQL ENTRY
                        </p>
                        <h2 className="font-display text-xl">
                            {isEdit ? t("titleEdit") : t("titleAdd")}
                        </h2>
                        <p className="text-[11px] text-muted mt-1">
                            {isEdit ? t("subtitleEdit") : t("subtitleAdd")}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="opacity-70 hover:opacity-100 transition"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="absolute top-6 right-14 -rotate-12 border px-3 py-1 text-[10px] uppercase tracking-widest border-border text-muted opacity-80">
                    {isEdit ? "REVISION" : "DRAFT"}
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    <Section title={t("questionsHeader")}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field error={errors.questionNL}>
                                <textarea
                                    placeholder={t("placeholders.questionNL")}
                                    rows={4}
                                    value={form.questionNL ?? ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            questionNL: e.target.value,
                                        })
                                    }
                                    className={areaClass(!!errors.questionNL)}
                                />
                            </Field>

                            <Field error={errors.questionEN}>
                                <textarea
                                    placeholder={t("placeholders.questionEN")}
                                    rows={4}
                                    value={form.questionEN ?? ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            questionEN: e.target.value,
                                        })
                                    }
                                    className={areaClass(!!errors.questionEN)}
                                />
                            </Field>
                        </div>
                    </Section>

                    <Section title={t("hintsHeader")}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <textarea
                                placeholder={t("placeholders.hintNL")}
                                rows={3}
                                value={form.hintNL ?? ""}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        hintNL: e.target.value,
                                    })
                                }
                                className={areaClass(false)}
                            />

                            <textarea
                                placeholder={t("placeholders.hintEN")}
                                rows={3}
                                value={form.hintEN ?? ""}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        hintEN: e.target.value,
                                    })
                                }
                                className={areaClass(false)}
                            />
                        </div>
                    </Section>

                    <Section title={t("queryOutputHeader")}>
                        <textarea
                            placeholder={t("placeholders.queryOutput")}
                            rows={4}
                            value={form.queryOutput ?? ""}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    queryOutput: e.target.value,
                                })
                            }
                            className={`font-mono ${areaClass(false)}`}
                        />
                    </Section>

                    <Section title={t("solutionsHeader")}>
                        {errors.solutionQueries && (
                            <p className="text-[11px] text-error uppercase tracking-wider mb-3">
                                {errors.solutionQueries as unknown as string}
                            </p>
                        )}

                        <div className="space-y-3">
                            {form.solutionQueries?.map((sol, index) => (
                                <div
                                    key={index}
                                    className="border border-border bg-paper p-3"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 shrink-0 pt-2 text-[10px] uppercase tracking-widest text-muted">
                                            {String(index + 1).padStart(2, "0")}
                                        </div>

                                        <textarea
                                            placeholder={t("placeholders.solution")}
                                            rows={3}
                                            value={sol}
                                            onChange={(e) =>
                                                updateSolution(index, e.target.value)
                                            }
                                            className="w-full bg-transparent border border-border p-3 font-mono text-sm resize-none outline-none focus:border-accent"
                                        />

                                        <button
                                            onClick={() => removeSolution(index)}
                                            className="mt-1 flex items-center justify-center w-9 h-9 border border-error text-ink hover:bg-error hover:text-paper transition -rotate-1"
                                            title={t("removeSolution")}
                                            type="button"
                                        >
                                            <FiTrash2 className="text-[14px]" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addSolution}
                            type="button"
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-accent text-accent hover:bg-accent hover:text-paper transition rotate-[0.5deg]"
                        >
                            <FaPlus className="text-xs" />
                            {t("addSolution")}
                        </button>
                    </Section>
                </div>

                <div className="flex justify-between gap-3 px-6 py-4 border-t border-border bg-surface-1 shrink-0">
                    <div>
                        {isEdit && (
                            <button
                                onClick={() => setConfirmDeleteDialogOpen(true)}
                                className="px-4 py-2 border border-error text-ink hover:bg-error hover:text-paper transition -rotate-1"
                            >
                                {t("delete")}
                            </button>
                        )}
                    </div>

                    <div className="flex gap-3 ml-auto">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-border text-muted hover:bg-ink hover:text-paper transition"
                        >
                            {t("cancel")}
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={mutation.isPending}
                            className="px-4 py-2 border-2 border-accent text-accent hover:bg-accent hover:text-paper transition rotate-1 disabled:opacity-50"
                        >
                            {mutation.isPending
                                ? t("saving")
                                : isEdit
                                  ? t("save")
                                  : t("create")}
                        </button>
                    </div>
                </div>

                <ConfirmDialog
                    open={confirmDeleteDialogOpen}
                    onClose={() => setConfirmDeleteDialogOpen(false)}
                    onConfirm={async () => {
                        if (!exercise) return;
                        await exerciseService.deleteExercise(exercise.exerciseId);
                        queryClient.invalidateQueries({
                            queryKey: ["exercises", chapterId],
                        });
                        setConfirmDeleteDialogOpen(false);
                        onClose();
                    }}
                    title={t("confirm.title")}
                    description={t("confirm.description")}
                    type="delete"
                />
            </div>
        </div>
    );
}

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="border border-border bg-surface-2 p-4">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-4 border-l-2 border-accent pl-3">
                {title}
            </h3>
            {children}
        </section>
    );
}

function Field({
    error,
    children,
}: {
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            {children}
            {error && (
                <p className="text-[11px] text-error mt-1 uppercase tracking-wider">
                    {error}
                </p>
            )}
        </div>
    );
}

function areaClass(hasError?: boolean) {
    return `w-full bg-transparent border p-3 text-sm resize-none outline-none transition ${
        hasError
            ? "border-error text-error"
            : "border-border focus:border-accent"
    }`;
}