"use client";

import Header from "@/components/header";
import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";

export default function Page() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="min-h-screen">
            <Header />

            <div className="max-w-350 mx-auto p-6 flex justify-center items-center min-h-[80vh]">
                <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white px-8 py-8 shadow-sm hover:shadow-lg transition-shadow">
                    <div className="mb-8 text-center">
                        <h1 className="text-xl font-semibold text-gray-900 mb-2">
                            Login
                        </h1>
                        <p className="text-lg text-gray-600">
                            Databasement
                        </p>
                    </div>

                    <form className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>

                            <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-3 bg-white focus-within:border-black transition-colors">
                                <FaUser className="text-gray-500 text-sm" />

                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    placeholder="Enter username"
                                    className="w-full outline-none text-sm text-gray-900 placeholder:text-gray-400 bg-transparent"
                                />
                            </div>
                        </div>

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
                                    placeholder="Enter password"
                                    className="w-full outline-none text-sm text-gray-900 placeholder:text-gray-400 bg-transparent"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 bg-black text-white text-sm px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
