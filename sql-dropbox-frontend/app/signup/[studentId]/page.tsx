"use client";

import Header from "@/components/header";
import { authService } from "@/services/authService";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa6";

export default function Page() {
    const params = useParams();
    const studentId = (params.studentId as string) ?? undefined;

    const [password, setPassword] = useState("");

    const { data, isLoading, error } = useQuery({
        queryKey: ["student", studentId],
        queryFn: () => authService.setupPassword(studentId!),
        enabled: !!studentId,
        retry: false,
    });

    if (error) {
        // TODO: route to 404 page
        return <div>Error: {(error as Error).message}</div>;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />

                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                    <p className="text-sm text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header />

            <div className="max-w-350 mx-auto p-6 flex justify-center items-center min-h-[80vh]">
                <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white px-8 py-8 shadow-sm hover:shadow-lg transition-shadow">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-xl font-semibold text-gray-900 mb-2">
                            Welcome {data.firstName}!
                        </h1>
                        <p className="text-gray-600">
                            Please set a password to activate your account
                        </p>
                    </div>

                    {/* Form */}
                    <form className="space-y-5">
                        {/* UserId (readonly) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                User ID
                            </label>

                            <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                                <FaEnvelope className="text-gray-500 text-sm" />

                                <input
                                    type="text"
                                    value={data.userId}
                                    readOnly
                                    className="w-full outline-none text-sm text-gray-700 bg-transparent"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>

                            <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-3 bg-white focus-within:border-black transition-colors">
                                <FaLock className="text-gray-500 text-sm" />

                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Enter a secure password"
                                    className="w-full outline-none text-sm text-gray-900 placeholder:text-gray-400 bg-transparent"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 bg-black text-white text-sm px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                        >
                            Create account
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
