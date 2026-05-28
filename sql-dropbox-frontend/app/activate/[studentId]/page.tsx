"use client";

import Header from "@/components/header";
import { authService } from "@/services/authService";
import { authUtils } from "@/utils/authUtils";
import { useQuery } from "@tanstack/react-query";
import { notFound, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Loading from "@/components/loading";

export default function Page() {
    const router = useRouter();
    const t = useTranslations("Activate");

    const params = useParams();
    const studentId = (params.studentId as string) ?? undefined;

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");

    const { data, isLoading, error } = useQuery({
        queryKey: ["student", studentId],
        queryFn: () => authService.getAccountSetup(studentId!),
        enabled: !!studentId,
        retry: false,
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage("");

        if (!password || !confirmPassword) {
            setErrorMessage(t("errors.empty"));
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage(t("errors.mismatch"));
            return;
        }

        if (password.length < 6) {
            setErrorMessage(t("errors.tooShort"));
            return;
        }

        try {
            authUtils.setup(router, studentId, password);
        } catch (err: any) {
            setErrorMessage(err.message ?? t("errors.generic"));
        }
    };

    if (error) return notFound();

    if (isLoading) {
        return (
            <Loading />
        );
    }

    return (
        <div className="min-h-screen flex flex-col font-mono">
            <Header />

            <main className="flex-1 flex items-center justify-center px-6">
                {/* DOCUMENT SHEET */}
                <div className="w-full max-w-md bg-paper-light border border-border shadow-2xl">
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
                        {/* USER ID */}
                        <div>
                            <label className="text-xs uppercase tracking-widest text-muted">
                                {t("userId")}
                            </label>

                            <div className="flex items-center gap-2 border-b border-border py-2">
                                <FaEnvelope className="text-muted text-sm" />
                                <input
                                    type="text"
                                    value={data?.userId}
                                    readOnly
                                    className="w-full bg-transparent outline-none text-sm text-ink"
                                />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label className="text-xs uppercase tracking-widest text-muted">
                                {t("password")}
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
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="text-muted hover:text-ink text-sm"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div>
                            <label className="text-xs uppercase tracking-widest text-muted">
                                {t("confirmPassword")}
                            </label>

                            <div className="flex items-center gap-2 border-b border-border py-2">
                                <FaLock className="text-muted text-sm" />

                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    placeholder={t("confirmPasswordPlaceholder")}
                                    className="w-full bg-transparent outline-none text-sm caret-ink"
                                />

                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() =>
                                        setShowConfirmPassword((p) => !p)
                                    }
                                    className="text-muted hover:text-ink text-sm"
                                >
                                    {showConfirmPassword ? (
                                        <FiEyeOff />
                                    ) : (
                                        <FiEye />
                                    )}
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
                                disabled={
                                    !password || password !== confirmPassword
                                }
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
                                {t("submit")}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
