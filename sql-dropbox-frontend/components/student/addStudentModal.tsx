"use client";

import { useState } from "react";
import { FaTimes, FaExclamationTriangle, FaCheck } from "react-icons/fa";
import { userService } from "@/services/userService";

interface Props {
    courseId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddStudentModal({
    courseId,
    onClose,
    onSuccess,
}: Props) {
    const [userCode, setUserCode] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit() {
        if (!userCode.trim() || !email.trim()) {
            setError("Student code and email are required.");
            return;
        }
        setSubmitting(true);
        setError(null);
        setSuccess(false);
        try {
            await userService.addStudent(courseId, {
                userCode: userCode.trim(),
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
            });
            setSuccess(true);
            setUserCode("");
            setFirstName("");
            setLastName("");
            setEmail("");
            onSuccess();
        } catch (e: any) {
            console.log(e);
            setError(e instanceof Error ? e.message : "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter") handleSubmit();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-base font-semibold text-gray-900">
                        Add student
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500">
                                Student code{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={userCode}
                                onChange={(e) => setUserCode(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="r1234567"
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="jane.doe@student.ucll.be"
                                type="email"
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500">
                                First name
                            </label>
                            <input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Jane"
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500">
                                Last name
                            </label>
                            <input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Doe"
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                            <FaExclamationTriangle className="shrink-0" />{" "}
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                            <FaCheck className="shrink-0" /> Student added
                            successfully.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        disabled={submitting}
                        onClick={handleSubmit}
                        className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {submitting ? "Adding…" : "Add student"}
                    </button>
                </div>
            </div>
        </div>
    );
}
