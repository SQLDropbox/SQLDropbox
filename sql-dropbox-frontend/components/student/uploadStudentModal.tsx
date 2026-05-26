"use client";

import { useState } from "react";
import { FaTimes, FaExclamationTriangle, FaCheck } from "react-icons/fa";
import { userService } from "@/services/userService";

interface Props {
    courseId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UploadStudentsModal({
    courseId,
    onClose,
    onSuccess,
}: Props) {
    const [file, setFile] = useState<File | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const isValid = file !== null;

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selected = e.target.files?.[0];

        setError(null);
        setSuccess(false);

        if (!selected) {
            setFile(null);
            return;
        }

        // Only allow CSV
        const isCsv =
            selected.type === "text/csv" ||
            selected.name.toLowerCase().endsWith(".csv");

        if (!isCsv) {
            setError("Only CSV files are allowed.");
            setFile(null);
            return;
        }

        setFile(selected);
    }

    async function handleSubmit() {
        if (!file) {
            setError("Please select a CSV file.");
            return;
        }

        setSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            await userService.importStudents(courseId, file);

            setSuccess(true);
            setFile(null);
            onSuccess();

            setTimeout(() => setSuccess(false), 3000);
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "Something went wrong."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-base font-semibold text-gray-900">
                        Import students (CSV)
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <div className="px-6 py-5 flex flex-col gap-4">

                        {/* File input */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-gray-500">
                                CSV file *
                            </label>

                            <input
                                type="file"
                                accept=".csv,text/csv"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-600
                                           file:mr-4 file:py-2 file:px-4
                                           file:rounded-md file:border-0
                                           file:text-sm file:font-semibold
                                           file:bg-black file:text-white
                                           hover:file:bg-gray-800"
                            />

                            {file && (
                                <p className="text-xs text-gray-500">
                                    Selected: {file.name}
                                </p>
                            )}
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                                <FaExclamationTriangle />
                                {error}
                            </div>
                        )}

                        {/* Success */}
                        {success && (
                            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                                <FaCheck />
                                Import completed successfully.
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Close
                        </button>

                        <button
                            type="submit"
                            disabled={submitting || !isValid}
                            className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Uploading…" : "Upload CSV"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}