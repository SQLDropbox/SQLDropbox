"use client";

import { FaTimes } from "react-icons/fa";
import { Chapter } from "@/types/types";

interface Props {
    open: boolean;
    onClose: () => void;
    chapter: Chapter;
}

export default function EditChapterDialog({ open, onClose, chapter }: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
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
                    {/* FORM */}
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="border px-4 py-2 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onClose}
                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
