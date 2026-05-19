"use client";

import { useEffect, useState } from "react";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { FaTimes } from "react-icons/fa";

import { Chapter } from "@/types/types";
import { chapterService } from "@/services/chapterService";

interface Props {
    open: boolean;
    onClose: () => void;
    chapter: Chapter;
}

export default function EditChapterDialog({
    open,
    onClose,
    chapter,
}: Props) {
    const queryClient = useQueryClient();

    const [formData, setFormData] =
        useState<Chapter>(chapter);

    useEffect(() => {
        setFormData(chapter);
    }, [chapter]);

    const { mutate, isPending } = useMutation({
        mutationFn: () =>
            chapterService.updateChapter(
                chapter.chapterId,
                formData
            ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["course"],
            });

            onClose();
        },
    });

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
                onClick={(e) =>
                    e.stopPropagation()
                }
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900">
                            Edit Chapter
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Update chapter settings
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-black"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="space-y-5">
                    <input
                        type="text"
                        placeholder="Dutch chapter name"
                        value={formData.chapterNameNL}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                chapterNameNL:
                                    e.target.value,
                            })
                        }
                        className="w-full border rounded-lg px-4 py-2"
                    />

                    <input
                        type="text"
                        placeholder="English chapter name"
                        value={formData.chapterNameEN}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                chapterNameEN:
                                    e.target.value,
                            })
                        }
                        className="w-full border rounded-lg px-4 py-2"
                    />

                    <textarea
                        placeholder="Dutch description"
                        value={
                            formData.chapterDescriptionNL
                        }
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                chapterDescriptionNL:
                                    e.target.value,
                            })
                        }
                        className="w-full border rounded-lg px-4 py-2"
                    />

                    <textarea
                        placeholder="English description"
                        value={
                            formData.chapterDescriptionEN
                        }
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                chapterDescriptionEN:
                                    e.target.value,
                            })
                        }
                        className="w-full border rounded-lg px-4 py-2"
                    />

                    <input
                        type="number"
                        placeholder="Exercise count"
                        value={
                            formData.amountOfExercises
                        }
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                amountOfExercises:
                                    Number(
                                        e.target.value
                                    ),
                            })
                        }
                        className="w-full border rounded-lg px-4 py-2"
                    />
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="border px-4 py-2 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => mutate()}
                        disabled={isPending}
                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                    >
                        {isPending
                            ? "Saving..."
                            : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}