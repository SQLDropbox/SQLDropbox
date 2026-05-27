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

    const isValid =
        userCode.trim() !== "" &&
        firstName.trim() !== "" &&
        lastName.trim() !== "" &&
        email.trim() !== "";

    async function handleSubmit() {
        if (!isValid) {
            setError("All fields are required.");
            return;
        }

        setSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            const payload = {
                userCode: userCode.trim(),
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
            };

            await userService.addStudent(courseId, payload);

            setSuccess(true);

            setUserCode("");
            setFirstName("");
            setLastName("");
            setEmail("");

            onSuccess();

            setTimeout(() => setSuccess(false), 3000);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong.");
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
                        Add student
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
                        <div className="grid grid-cols-2 gap-3">
                            {/* User code */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-500">
                                    Student code *
                                </label>
                                <input
                                    value={userCode}
                                    onChange={(e) =>
                                        setUserCode(e.target.value)
                                    }
                                    placeholder="r1234567"
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-500">
                                    Email *
                                </label>
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                    placeholder="jane.doe@student.ucll.be"
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    required
                                />
                            </div>

                            {/* First name */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-500">
                                    First name *
                                </label>
                                <input
                                    value={firstName}
                                    onChange={(e) =>
                                        setFirstName(e.target.value)
                                    }
                                    placeholder="Jane"
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    required
                                />
                            </div>

                            {/* Last name */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-500">
                                    Last name *
                                </label>
                                <input
                                    value={lastName}
                                    onChange={(e) =>
                                        setLastName(e.target.value)
                                    }
                                    placeholder="Doe"
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    required
                                />
                            </div>
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
                                Student added successfully.
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
                            {submitting ? "Adding…" : "Add student"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
