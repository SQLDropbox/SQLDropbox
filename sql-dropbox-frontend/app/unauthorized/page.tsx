"use client";

import Header from "@/components/header";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { FaLock } from "react-icons/fa";
import { useTranslations } from "next-intl";

export default function Unauthorized() {
    const { user, role } = useAuth();
    const router = useRouter();
    const t = useTranslations("Unauthorized");

    return (
        <div className="min-h-screen flex flex-col bg-paper text-ink font-mono">
            <Header />

            <main className="flex-1 flex items-center justify-center px-6">
                {/* DOCUMENT SHEET */}
                <div
                    className="
                        w-full max-w-lg
                        bg-paper-light
                        border border-border
                        shadow-2xl
                        p-10
                        text-center
                        rotate-[-0.5deg]
                        relative
                    "
                >
                    {/* TOP STAMP */}
                    <div className="absolute -top-4 right-6 rotate-[-10deg] border-2 border-error text-error text-[10px] uppercase tracking-widest px-3 py-1 bg-paper-light">
                        {t("stamp")}
                    </div>

                    {/* CODE + ICON ROW */}
                    <div className="flex items-center justify-center gap-3 mb-4 text-error">
                        <FaLock className="text-3xl" />
                        <p className="text-6xl font-bold tracking-tight">403</p>
                    </div>

                    {/* TITLE */}
                    <h1 className="text-xl font-semibold uppercase tracking-widest mb-2">
                        {t("title")}
                    </h1>

                    {/* DESCRIPTION */}
                    <p className="text-sm text-muted leading-relaxed mb-6">
                        {t("description")}
                    </p>

                    {/* USER INFO */}
                    {user && (
                        <div className="mb-6 text-xs text-muted border border-border bg-paper px-4 py-3 text-left">
                            <p>
                                <span className="uppercase tracking-widest">
                                    {t("user")}:
                                </span>{" "}
                                {user.code}
                            </p>
                            <p>
                                <span className="uppercase tracking-widest">
                                    {t("role")}:
                                </span>{" "}
                                {role}
                            </p>
                        </div>
                    )}

                    {/* ACTIONS */}
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="
                                px-4 py-2
                                border border-border
                                text-muted
                                text-xs uppercase tracking-widest
                                hover:bg-ink hover:text-paper
                                transition
                            "
                        >
                            {t("goBack")}
                        </button>

                        <a
                            href="/"
                            className="
                                px-4 py-2
                                border-2 border-accent
                                text-accent
                                text-xs uppercase tracking-widest
                                hover:bg-accent hover:text-paper hover:border-ink
                                transition
                                rotate-1
                            "
                        >
                            {t("goHome")}
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}
