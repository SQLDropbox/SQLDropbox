"use client";

import { useEffect, useState } from "react";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

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

type FormErrors = Partial<
    Record<keyof Chapter, string>
>;

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

    const [form, setForm] =
        useState<Partial<Chapter>>(emptyForm);

    const [errors, setErrors] =
        useState<FormErrors>({});

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
            return chapterService.updateChapter(
                chapter.chapterId,
                form
            );
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

    const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
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

    const inputClass = (
        field: keyof Chapter
    ) =>
        `w-full border rounded-lg px-4 py-2 ${
            errors[field]
                ? "border-red-400 bg-red-50"
                : "border-gray-300"
        }`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
                {/* HEADER */}
                <div className="flex justify-between items-start px-6 py-5 border-b">
                    <div>
                        <h2 className="text-xl font-semibold">
                            {isEdit ? t("titleEdit") : t("titleAdd")}
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            {isEdit ? t("subtitleEdit") : t("subtitleAdd")}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-black"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                                {t("chapterNameEN")}
                            </label>
                            <input
                                placeholder={t("chapterNameENPlaceholder")}
                                value={
                                    form.chapterNameEN ?? ""
                                }
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        chapterNameEN:
                                            e.target.value,
                                    })
                                }
                                className={inputClass(
                                    "chapterNameEN"
                                )}
                            />

                            {errors.chapterNameEN && (
                                <p className="text-xs text-red-500 mt-1">
                                    {
                                        errors.chapterNameEN
                                    }
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                                {t("chapterNameNL")}
                            </label>
                            <input
                                placeholder={t("chapterNameNLPlaceholder")}
                                value={
                                    form.chapterNameNL ?? ""
                                }
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        chapterNameNL:
                                            e.target.value,
                                    })
                                }
                                className={inputClass(
                                    "chapterNameNL"
                                )}
                            />

                            {errors.chapterNameNL && (
                                <p className="text-xs text-red-500 mt-1">
                                    {
                                        errors.chapterNameNL
                                    }
                                </p>
                            )}
                        </div>
                    </div>

                    <textarea
                        placeholder={t("chapterDescriptionEN")}
                        rows={4}
                        value={
                            form.chapterDescriptionEN ??
                            ""
                        }
                        onChange={(e) =>
                            setForm({
                                ...form,
                                chapterDescriptionEN:
                                    e.target.value,
                            })
                        }
                        className={inputClass(
                            "chapterDescriptionEN"
                        )}
                    />

                    <textarea
                        placeholder={t("chapterDescriptionNL")}
                        rows={4}
                        value={
                            form.chapterDescriptionNL ??
                            ""
                        }
                        onChange={(e) =>
                            setForm({
                                ...form,
                                chapterDescriptionNL:
                                    e.target.value,
                            })
                        }
                        className={inputClass(
                            "chapterDescriptionNL"
                        )}
                    />

                    <input
                        type="number"
                        placeholder={t("amountOfExercises")}
                        value={
                            form.amountOfExercises ?? 0
                        }
                        onChange={(e) =>
                            setForm({
                                ...form,
                                amountOfExercises:
                                    Number(
                                        e.target.value
                                    ),
                            })
                        }
                        className={inputClass(
                            "amountOfExercises"
                        )}
                    />
                </div>

                {/* FOOTER */}
                <div className="flex justify-between gap-3 px-6 py-4 border-t">
                    {isEdit && (
                        <button
                            onClick={onDelete}
                            className="border border-gray-300 px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-400 transition-colors cursor-pointer"
                        >
                            {t("delete")}
                        </button>
                    )}

                    <div className="flex gap-3 ml-auto">
                        <button
                            onClick={onClose}
                            className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                            {t("cancel")}
                        </button>
                
                        <button
                            onClick={handleSubmit}
                            disabled={mutation.isPending}
                            className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors cursor-pointer"
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