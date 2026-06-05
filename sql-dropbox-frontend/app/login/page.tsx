"use client";

import Header from "@/components/header";
import { authUtils } from "@/utils/authUtils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Page() {
    const router = useRouter();
    const t = useTranslations("Login");

    const [emailOrCode, setEmailOrCode] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage("");

        if (!password) {
            setErrorMessage(t("errors.passwordEmpty"));
            return;
        }
        try {
            await authUtils.login(router, emailOrCode, password);
        } catch (err: any) {
            setErrorMessage(err.message ?? t("errors.generic"));
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-mono">
            <Header />

            <main className="flex-1 flex items-center justify-center px-6">
                {/* DOCUMENT SHEET */}
                <div
                    className="
                        w-full max-w-md
                        bg-paper-light
                        border border-border
                        shadow-2xl
                        relative
                    "
                >
                    {/* HEADER */}
                    <div className="border-b border-border bg-paper px-6 py-4">
                        <h1 className="text-sm uppercase tracking-widest font-semibold">
                            {t("title")}
                        </h1>
                        <p className="text-xs text-muted mt-1">
                            {t("subtitle")}
                        </p>
                    </div>

                    {/* BODY */}
                    <form
                        onSubmit={handleSubmit}
                        className="px-6 py-6 space-y-5"
                    >
                        {/* USER FIELD */}
                        <div>
                            <label className="text-xs uppercase tracking-wide text-muted">
                                {t("userLabel")}
                            </label>

                            <div className="flex items-center gap-2 border-b border-border py-2">
                                <FaUser className="text-muted text-sm" />
                                <input
                                    type="text"
                                    value={emailOrCode}
                                    onChange={(e) =>
                                        setEmailOrCode(e.target.value)
                                    }
                                    placeholder={t("userPlaceholder")}
                                    className="w-full bg-transparent outline-none text-sm caret-ink"
                                />
                            </div>
                        </div>

                        {/* PASSWORD FIELD */}
                        <div>
                            <label className="text-xs uppercase tracking-wide text-muted">
                                {t("passwordLabel")}
                            </label>

                            <div className="flex items-center gap-2 border-b border-border py-2">
                                <FaLock className="text-muted text-sm" />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder={t("passwordPlaceholder")}
                                    className="w-full bg-transparent outline-none text-sm caret-ink"
                                />

                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() =>
                                        setShowPassword((prev) => !prev)
                                    }
                                    className="text-muted hover:text-ink text-sm"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        {/* ERROR */}
                        {errorMessage && (
                            <p className="text-xs text-error uppercase tracking-widest">
                                {errorMessage}
                            </p>
                        )}

                        {/* ACTION */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={!emailOrCode || !password}
                                className="
                                    px-4 py-2
                                    border-2 border-accent
                                    text-accent
                                    text-xs uppercase tracking-widest
                                    hover:bg-accent hover:text-paper
                                    transition
                                    rotate-1
                                    disabled:opacity-40
                                    disabled:cursor-not-allowed
                                "
                            >
                                {t("login")}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
