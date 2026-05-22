"use client";

import { useEffect, useState } from "react";

interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: (newCourseId?: string) => void;
    courseName?: string;
    originalCourseId?: string;
    isDuplicating: boolean;
}

export default function DuplicateCourseModal({
    open,
    onClose,
    onConfirm,
    courseName,
    originalCourseId,
    isDuplicating,
}: Props) {
    const [newCourseIdInput, setNewCourseIdInput] = useState("");

    useEffect(() => {
        if (open) {
            setNewCourseIdInput("");
        }
    }, [open]);

    if (!open) return null;

    function handleConfirm() {
        const customId = newCourseIdInput.trim() || undefined;
        onConfirm(customId);
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Duplicate Course
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                    You are about to duplicate <strong>{courseName}</strong>. 
                    Optionally provide a custom URL (CourseId). Leave empty to auto-generate one.
                </p>
                
                <input
                    type="text"
                    placeholder={`e.g. ${originalCourseId}-copy`}
                    value={newCourseIdInput}
                    onChange={(e) => setNewCourseIdInput(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 mb-6"
                />
                
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isDuplicating}
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {isDuplicating ? "Duplicating..." : "Confirm"}
                    </button>
                </div>
            </div>
        </div>
    );
}