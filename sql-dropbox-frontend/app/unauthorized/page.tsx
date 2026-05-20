"use client";

import Header from "@/components/header";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { FaLock } from "react-icons/fa";

export default function Unauthorized() {
    const { user, role } = useAuth();
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <p className="text-6xl mb-4">
                    <FaLock />
                </p>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Access Denied
                </h1>

                <p className="text-gray-500 mb-1">
                    You don't have permission to view this page.
                </p>

                {user && (
                    <p className="text-sm text-gray-400 mb-6">
                        Logged in as{" "}
                        <span className="font-medium text-gray-600">
                            {user.code}
                        </span>{" "}
                        ({role})
                    </p>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={() => router.back()}
                        className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                    >
                        Go Back
                    </button>
                    <a
                        href="/"
                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                    >
                        Go Home
                    </a>
                </div>
            </div>
        </div>
    );
}
