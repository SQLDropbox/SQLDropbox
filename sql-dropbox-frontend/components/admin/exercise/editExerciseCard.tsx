"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaTimes, FaPlus } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { useTranslations } from "next-intl";

import { Exercise, QueryAction, Requirement } from "@/types/types";
import { exerciseService } from "@/services/exerciseService";
import { requirementService } from "@/services/requirementService";
import ConfirmDialog from "@/components/dialog/confirmDialog";

interface Props {
    open: boolean;
    onClose: () => void;
    mode: "add" | "edit";
    chapterId: number;
    exercise?: Exercise;
}

type FormErrors = Partial<Record<keyof Exercise, string>> & {
    requirements?: string;
};

type RequirementFormRow = {
    requirementId?: number;
    statement: string;
    use: boolean;
};

const emptyForm: Partial<Exercise> = {
    questionNL: "",
    questionEN: "",
    hintNL: "",
    hintEN: "",
    queryAction: QueryAction.Select,
    validationQuery: "",
    solutionQuery: "",
};

export default function EditExerciseCard({
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
    const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] =
        useState(false);
    const [requirements, setRequirements] = useState<RequirementFormRow[]>([]);
    const [didInit, setDidInit] = useState(false);

    const { data: loadedRequirements = [], isLoading: requirementsLoading } =
        useQuery<Requirement[]>({
            queryKey: ["requirements", exercise?.exerciseId],
            queryFn: () =>
                requirementService.getRequirementsForExercise(
                    exercise!.exerciseId,
                ),
            enabled: open && isEdit && !!exercise?.exerciseId,
        });

    useEffect(() => {
        if (!open) {
            setDidInit(false);
            return;
        }

        if (didInit) return;
        if (isEdit && requirementsLoading) return;

        if (exercise && isEdit) {
            console.log(exercise);
            setForm({
                ...exercise,
                solutionQuery: exercise?.solutions?.[0]?.query,
                chapterId,
            });

            setRequirements(
                loadedRequirements.map((req) => ({
                    requirementId: req.requirementId,
                    statement: req.statement ?? "",
                    use: req.use ?? false,
                })),
            );
        } else {
            setForm({
                ...emptyForm,
                chapterId,
            });
            setRequirements([]);
        }

        setErrors({});
        setDidInit(true);
    }, [
        open,
        didInit,
        isEdit,
        requirementsLoading,
        chapterId,
        exercise,
        loadedRequirements,
    ]);

    function validate() {
        const newErrors: FormErrors = {};

        if (!form.questionNL?.trim()) {
            newErrors.questionNL = t("errors.questionNLRequired");
        }

        if (!form.questionEN?.trim()) {
            newErrors.questionEN = t("errors.questionENRequired");
        }

        if (!form.solutionQuery?.trim()) {
            newErrors.solutionQuery = t("errors.solutionRequired");
        }

        if (
            form.queryAction !== QueryAction.Select &&
            !form.validationQuery?.trim()
        ) {
            newErrors.validationQuery = t("errors.validationQueryRequired");
        }

        const cleanedRequirementStatements = requirements
            .map((req) => req.statement.trim())
            .filter((statement) => statement !== "");

        const hasDuplicateRequirements =
            new Set(
                cleanedRequirementStatements.map((statement) =>
                    statement.toLowerCase(),
                ),
            ).size !== cleanedRequirementStatements.length;

        if (hasDuplicateRequirements) {
            newErrors.requirements = "Requirements must be unique.";
        }

        return newErrors;
    }

    async function syncRequirements(savedExerciseId: number) {
        const originalRequirements = isEdit ? loadedRequirements : [];

        const cleanedRequirements = requirements
            .map((req) => ({
                requirementId: req.requirementId,
                statement: req.statement.trim(),
                use: req.use,
            }))
            .filter((req) => req.statement !== "");

        const currentIds = new Set(
            cleanedRequirements
                .filter((req) => req.requirementId != null)
                .map((req) => req.requirementId as number),
        );

        const toCreate = cleanedRequirements.filter(
            (req) => req.requirementId == null,
        );

        const toUpdate = cleanedRequirements.filter(
            (req) => req.requirementId != null,
        );

        const toDelete = originalRequirements.filter(
            (req) => !currentIds.has(req.requirementId),
        );

        await Promise.all([
            ...toCreate.map((req) =>
                requirementService.createRequirementForExercise({
                    statement: req.statement,
                    use: req.use,
                    exerciseId: savedExerciseId,
                }),
            ),
            ...toUpdate.map((req) =>
                requirementService.updateRequirementForExercise(
                    req.requirementId!,
                    {
                        statement: req.statement,
                        use: req.use,
                        exerciseId: savedExerciseId,
                    },
                ),
            ),
            ...toDelete.map((req) =>
                requirementService.deleteRequirementForExercise(
                    req.requirementId,
                ),
            ),
        ]);
    }

    const mutation = useMutation({
        mutationFn: async () => {
            const cleanedForm = {
                ...form,
            };

            const savedExercise =
                isEdit && exercise
                    ? await exerciseService.updateExercise(
                          exercise.exerciseId,
                          cleanedForm,
                      )
                    : await exerciseService.addExercise(cleanedForm);

            const savedExerciseId =
                savedExercise?.exerciseId ?? exercise?.exerciseId;

            if (!savedExerciseId) {
                throw new Error("Could not determine saved exercise ID.");
            }

            await syncRequirements(savedExerciseId);

            return savedExercise;
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["exercises", chapterId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["requirements"],
                }),
            ]);

            onClose();
        },
    });

    function handleSubmit() {
        const newErrors = validate();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        mutation.mutate();
    }

    const addRequirement = () => {
        setRequirements((prev) => [...prev, { statement: "", use: false }]);
    };

    const updateRequirement = (
        index: number,
        key: keyof RequirementFormRow,
        value: string | boolean,
    ) => {
        setRequirements((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, [key]: value } : item,
            ),
        );
    };

    const removeRequirement = (index: number) => {
        setRequirements((prev) => prev.filter((_, i) => i !== index));
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
                        type="button"
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

                    <Section title={t("solutionHeader")}>
                        {errors.solutionQuery && (
                            <p className="text-[11px] text-error uppercase tracking-wider mb-3">
                                {errors.solutionQuery as unknown as string}
                            </p>
                        )}

                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <textarea
                                    placeholder={t("placeholders.solution")}
                                    rows={3}
                                    value={form.solutionQuery ?? ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            solutionQuery: e.target.value,
                                        })
                                    }
                                    className="w-full bg-transparent border border-border p-3 font-mono text-sm resize-none outline-none focus:border-accent"
                                />
                            </div>
                        </div>
                    </Section>

                    <Section title={t("queryActionHeader")}>
                        <select
                            value={form.queryAction ?? QueryAction.Select}
                            onChange={(e) => {
                                setForm((prev) => ({
                                    ...prev,
                                    queryAction: Number(
                                        e.target.value,
                                    ) as QueryAction,
                                }));
                            }}
                        >
                            {Object.entries(QueryAction)
                                .filter(([key]) => isNaN(Number(key))) // keep only names, not numeric reverse mapping
                                .map(([key, value]) => (
                                    <option key={key} value={value}>
                                        {key}
                                    </option>
                                ))}
                        </select>
                    </Section>

                    {form.queryAction !== QueryAction.Select && (
                        <Section title={t("validationQueryHeader")}>
                            {errors.validationQuery && (
                                <p className="text-[11px] text-error uppercase tracking-wider mb-3">
                                    {
                                        errors.validationQuery as unknown as string
                                    }
                                </p>
                            )}

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <textarea
                                        placeholder={t(
                                            "placeholders.validationQuery",
                                        )}
                                        rows={3}
                                        value={form.validationQuery ?? ""}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                validationQuery: e.target.value,
                                            })
                                        }
                                        className="w-full bg-transparent border border-border p-3 font-mono text-sm resize-none outline-none focus:border-accent"
                                    />
                                </div>
                            </div>
                        </Section>
                    )}

                    <Section title="Requirements">
                        {errors.requirements && (
                            <p className="text-[11px] text-error uppercase tracking-wider mb-3">
                                {errors.requirements}
                            </p>
                        )}

                        {requirementsLoading && isEdit && !didInit ? (
                            <p className="text-[11px] uppercase tracking-wider text-muted">
                                Loading requirements...
                            </p>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {requirements.length === 0 && (
                                        <div className="border border-dashed border-border bg-paper p-4">
                                            <p className="text-[11px] uppercase tracking-widest text-muted">
                                                No requirements added yet.
                                            </p>
                                        </div>
                                    )}

                                    {requirements.map((requirement, index) => (
                                        <div
                                            key={
                                                requirement.requirementId ??
                                                `new-${index}`
                                            }
                                            className="border border-border bg-paper p-3"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 shrink-0 pt-2 text-[10px] uppercase tracking-widest text-muted">
                                                    {String(index + 1).padStart(
                                                        2,
                                                        "0",
                                                    )}
                                                </div>

                                                <div className="flex-1 space-y-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Requirement statement"
                                                        value={
                                                            requirement.statement
                                                        }
                                                        onChange={(e) =>
                                                            updateRequirement(
                                                                index,
                                                                "statement",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full bg-transparent border border-border p-3 text-sm outline-none focus:border-accent"
                                                    />

                                                    <label className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                requirement.use
                                                            }
                                                            onChange={(e) =>
                                                                updateRequirement(
                                                                    index,
                                                                    "use",
                                                                    e.target
                                                                        .checked,
                                                                )
                                                            }
                                                        />
                                                        Required for validation
                                                    </label>
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        removeRequirement(index)
                                                    }
                                                    className="mt-1 flex items-center justify-center w-9 h-9 border border-error text-ink hover:bg-error hover:text-paper transition -rotate-1"
                                                    title="Remove requirement"
                                                    type="button"
                                                >
                                                    <FiTrash2 className="text-[14px]" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={addRequirement}
                                    type="button"
                                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-accent text-accent hover:bg-accent hover:text-paper transition rotate-[0.5deg]"
                                >
                                    <FaPlus className="text-xs" />
                                    Add requirement
                                </button>
                            </>
                        )}
                    </Section>
                </div>

                <div className="flex justify-between gap-3 px-6 py-4 border-t border-border bg-surface-1 shrink-0">
                    <div>
                        {isEdit && (
                            <button
                                onClick={() => setConfirmDeleteDialogOpen(true)}
                                className="px-4 py-2 border border-error text-ink hover:bg-error hover:text-paper transition -rotate-1"
                                type="button"
                            >
                                {t("delete")}
                            </button>
                        )}
                    </div>

                    <div className="flex gap-3 ml-auto">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-border text-muted hover:bg-ink hover:text-paper transition"
                            type="button"
                        >
                            {t("cancel")}
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={
                                mutation.isPending ||
                                (isEdit && requirementsLoading && !didInit)
                            }
                            className="px-4 py-2 border-2 border-accent text-accent hover:bg-accent hover:text-paper transition rotate-1 disabled:opacity-50"
                            type="button"
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

                        await exerciseService.deleteExercise(
                            exercise.exerciseId,
                        );

                        await Promise.all([
                            queryClient.invalidateQueries({
                                queryKey: ["exercises", chapterId],
                            }),
                            queryClient.invalidateQueries({
                                queryKey: ["requirements", exercise.exerciseId],
                            }),
                        ]);

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
