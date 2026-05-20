"use client";

import Header from "@/components/header";
import { useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <p className="text-6xl mb-4 font-bold">
                    404
                </p>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Page Not Found
                </h1>

                <p className="text-gray-500 mb-6">
                    This page doesn't exist or the link is invalid.
                </p>

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