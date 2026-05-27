"use client";

import { useRef, useState } from "react";
import {
    FaTimes,
    FaExclamationTriangle,
    FaCheck,
    FaUpload,
} from "react-icons/fa";

import { userService } from "@/services/userService";
import { User } from "@/types/types";

interface Props {
    courseId: string;
    onClose: () => void;
    onSuccess: () => void;
}

type Step = "upload" | "load";

export default function ImportStudentsModal({
    courseId,
    onClose,
    onSuccess,
}: Props) {
    const [step, setStep] = useState<Step>("upload");

    const [file, setFile] = useState<File | null>(null);
    const [students, setStudents] = useState<User[]>([]);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [dragging, setDragging] = useState(false);

    const inputRef = useRef<HTMLInputElement | null>(null);

    // ------------------------------------
    // VALIDATE FILE
    // ------------------------------------
    function validateFile(selected: File | null) {
        setError(null);
        setSuccess(false);

        if (!selected) {
            setFile(null);
            return;
        }

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

    // ------------------------------------
    // FILE PICKER
    // ------------------------------------
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        validateFile(e.target.files?.[0] || null);
    }

    // ------------------------------------
    // DRAG & DROP
    // ------------------------------------
    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();

        setDragging(false);

        const droppedFile = e.dataTransfer.files?.[0];

        if (droppedFile) {
            validateFile(droppedFile);
        }
    }

    // ------------------------------------
    // STEP 1: LOAD
    // ------------------------------------
    async function handleLoad() {
        if (!file) {
            setError("Please select a CSV file.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const res = await userService.previewImportStudents(courseId, file);

            setStudents(res.students);
            setStep("load");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    }

    // ------------------------------------
    // STEP 2: IMPORT
    // ------------------------------------
    async function handleImport() {
        setSubmitting(true);
        setError(null);

        try {
            await userService.importStudents(courseId, students);

            setSuccess(true);

            setTimeout(() => {
                onSuccess();
                onClose();
            }, 800);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[80vh]">
                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                    <h2 className="text-base font-semibold">
                        Import students (CSV)
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="px-6 py-5 flex-1 overflow-y-auto">
                    {/* ---------------- UPLOAD STEP ---------------- */}
                    {step === "upload" && (
                        <div className="flex flex-col gap-4">
                            <div
                                onClick={() => inputRef.current?.click()}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragging(true);
                                }}
                                onDragLeave={() => {
                                    setDragging(false);
                                }}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
                                    ${
                                        dragging
                                            ? "border-black bg-gray-50"
                                            : "border-gray-300 hover:border-gray-400"
                                    }`}
                            >
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept=".csv,text/csv"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                <FaUpload className="text-xl mx-auto mb-2" />

                                <p className="text-sm font-medium">
                                    Drag & drop CSV file here
                                </p>

                                <p className="text-xs text-gray-400">
                                    or click to browse
                                </p>

                                {file && (
                                    <p className="mt-2 text-xs text-gray-500">
                                        Selected: {file.name}
                                    </p>
                                )}
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                                    <FaExclamationTriangle />
                                    {error}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ---------------- LOAD STEP ---------------- */}
                    {step === "load" && (
                        <div className="flex flex-col gap-4">
                            <div className="text-sm text-gray-600">
                                Students to import:{" "}
                                <span className="font-semibold">
                                    {students.length}
                                </span>
                            </div>

                            <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-left sticky top-0">
                                        <tr>
                                            <th className="p-2">Code</th>
                                            <th className="p-2">Name</th>
                                            <th className="p-2">Email</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {students.map((s, i) => (
                                            <tr key={i} className="border-t">
                                                <td className="p-2">
                                                    {s.userCode}
                                                </td>

                                                <td className="p-2">
                                                    {s.firstName} {s.lastName}
                                                </td>

                                                <td className="p-2">
                                                    {s.email}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                                    <FaExclamationTriangle />
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                                    <FaCheck />
                                    Import completed successfully
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t shrink-0 bg-white">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
                    >
                        Close
                    </button>

                    {step === "upload" && (
                        <button
                            onClick={handleLoad}
                            disabled={submitting || !file}
                            className="px-4 py-2 text-sm bg-black text-white rounded-lg disabled:opacity-40"
                        >
                            {submitting ? "Processing..." : "Load"}
                        </button>
                    )}

                    {step === "load" && (
                        <button
                            onClick={handleImport}
                            disabled={submitting}
                            className="px-4 py-2 text-sm bg-black text-white rounded-lg disabled:opacity-40"
                        >
                            {submitting ? "Importing..." : "Confirm Import"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
