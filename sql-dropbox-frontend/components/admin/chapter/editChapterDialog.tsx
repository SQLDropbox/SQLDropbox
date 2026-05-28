"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaTimes } from "react-icons/fa";
import { useTranslations } from "next-intl";

import { Chapter } from "@/types/types";
import { chapterService } from "@/services/chapterService";
import ConfirmDialog from "@/components/dialog/confirmDialog";

interface Props {
    open: boolean;
    onClose: () => void;
    mode: "add" | "edit";
    courseId: string;
    chapter?: Chapter;
}

type FormErrors = Partial<Record<keyof Chapter, string>>;

const emptyForm: Partial<Chapter> = {
    chapterNameNL: "",
    chapterNameEN: "",
    chapterDescriptionNL: "",
    chapterDescriptionEN: "",
    amountOfExercises: 0,
};

export default function EditChapterDialog({
    open,
    onClose,
    mode,
    courseId,
    chapter,
}: Props) {
    const queryClient = useQueryClient();
    const t = useTranslations("ChapterDialog");

    const isEdit = mode === "edit";

    const [form, setForm] = useState<Partial<Chapter>>(emptyForm);
    const [errors, setErrors] = useState<FormErrors>({});
    const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);

    useEffect(() => {
        if (!open) return;

        if (chapter && isEdit) {
            setForm(chapter);
        } else {
            setForm({
                ...emptyForm,
                courseId,
            });
        }

        setErrors({});
    }, [open, chapter, isEdit, courseId]);

    function validate() {
        const newErrors: FormErrors = {};

        if (!form.chapterNameNL?.trim()) {
            newErrors.chapterNameNL = t("errors.chapterNameNLRequired");
        }

        if (!form.chapterNameEN?.trim()) {
            newErrors.chapterNameEN = t("errors.chapterNameENRequired");
        }

        return newErrors;
    }

    const mutation = useMutation({
        mutationFn: async () => {
            if (mode === "edit" && chapter) {
                return chapterService.updateChapter(chapter.chapterId, form);
            }

            return chapterService.addChapter(courseId, form);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["course", courseId],
            });

            onClose();
        },
    });

    function onDelete() {
        if (!isEdit || !chapter) return;
        setConfirmDeleteDialogOpen(true);
    }

    async function handleSubmit() {
        const newErrors = validate();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        mutation.mutate();
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="relative w-full max-w-5xl aspect-[210/220] max-h-[90vh] bg-paper-light text-ink border border-border shadow-2xl flex flex-col font-mono">
                <div className="border-b border-border bg-paper px-6 py-4 flex justify-between items-start shrink-0">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted">
                            CHAPTER DOSSIER / COURSE ENTRY
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
                    {isEdit ? "EDIT MODE" : "NEW ENTRY"}
                </div>

                <div className="flex flex-col grow overflow-y-auto gap-2 px-6">
                    <Field
                        label={t("chapterNameEN")}
                        error={errors.chapterNameEN}
                    >
                        <input
                            placeholder={t("chapterNameENPlaceholder")}
                            value={form.chapterNameEN ?? ""}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    chapterNameEN: e.target.value,
                                })
                            }
                            className={inputClass(!!errors.chapterNameEN)}
                        />
                    </Field>

                    <Field
                        label={t("chapterNameNL")}
                        error={errors.chapterNameNL}
                    >
                        <input
                            placeholder={t("chapterNameNLPlaceholder")}
                            value={form.chapterNameNL ?? ""}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    chapterNameNL: e.target.value,
                                })
                            }
                            className={inputClass(!!errors.chapterNameNL)}
                        />
                    </Field>

                    <Field label={t("chapterDescriptionEN")}>
                        <textarea
                            placeholder={t("chapterDescriptionEN")}
                            rows={4}
                            value={form.chapterDescriptionEN ?? ""}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    chapterDescriptionEN: e.target.value,
                                })
                            }
                            className="w-full bg-transparent border border-border p-3 text-sm resize-none focus:border-accent outline-none"
                        />
                    </Field>

                    <Field label={t("chapterDescriptionNL")}>
                        <textarea
                            placeholder={t("chapterDescriptionNL")}
                            rows={4}
                            value={form.chapterDescriptionNL ?? ""}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    chapterDescriptionNL: e.target.value,
                                })
                            }
                            className="w-full bg-transparent border border-border p-3 text-sm resize-none focus:border-accent outline-none"
                        />
                    </Field>

                    <Field label={t("amountOfExercises")}>
                        <input
                            type="number"
                            placeholder={t("amountOfExercises")}
                            value={form.amountOfExercises ?? 0}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    amountOfExercises: Number(e.target.value),
                                })
                            }
                            className="w-full bg-transparent border-b border-border py-1 text-sm focus:border-accent outline-none"
                        />
                    </Field>
                </div>

                <div className="border-t border-border bg-surface-1 px-6 py-4 flex justify-between gap-3 shrink-0">
                    <div>
                        {isEdit && (
                            <button
                                onClick={onDelete}
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
                                  ? t("saveChanges")
                                  : t("createChapter")}
                        </button>
                    </div>
                </div>

                <ConfirmDialog
                    open={confirmDeleteDialogOpen}
                    onClose={() => setConfirmDeleteDialogOpen(false)}
                    onConfirm={async () => {
                        if (!chapter) return;

                        await chapterService.deleteChapter(chapter.chapterId);

                        queryClient.invalidateQueries({
                            queryKey: ["course", courseId],
                        });

                        setConfirmDeleteDialogOpen(false);
                        onClose();
                    }}
                    title={t("deleteTitle")}
                    description={t("deleteDescription")}
                    type="delete"
                />
            </div>
        </div>
    );
}

function inputClass(hasError?: boolean) {
    return `w-full bg-transparent border-b py-1 text-sm outline-none transition ${
        hasError
            ? "border-error text-error"
            : "border-border focus:border-accent"
    }`;
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="py-4">
            <label className="text-[11px] uppercase tracking-widest text-muted block mb-2">
                {label}
            </label>
            {children}
            {error && (
                <p className="text-[11px] text-error mt-1 uppercase tracking-wider">
                    {error}
                </p>
            )}
        </div>
    );
}