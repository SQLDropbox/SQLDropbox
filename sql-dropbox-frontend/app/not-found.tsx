"use client";

import Header from "@/components/header";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">404</h1>

                <p className="text-gray-600 mb-6">
                    This page doesn’t exist or the link is invalid.
                </p>

                <a
                    href="/"
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                >
                    Go Home
                </a>
            </div>
        </div>
    );
}
