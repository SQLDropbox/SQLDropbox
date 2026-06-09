"use client";

import Header from "@/components/header";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function NotFound() {
    const router = useRouter();
    const t = useTranslations("NotFound");

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

                    {/* BIG CODE */}
                    <p className="text-6xl font-bold text-error mb-4 tracking-tight">
                        404
                    </p>

                    {/* TITLE */}
                    <h1 className="text-xl font-semibold uppercase tracking-widest mb-2">
                        {t("title")}
                    </h1>

                    {/* DESCRIPTION */}
                    <p className="text-sm text-muted leading-relaxed mb-8">
                        {t("description")}
                    </p>

                    {/* ACTIONS */}
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="
                                px-4 py-2
                                border border-border
                                text-muted
                                text-xs uppercase tracking-widest
                                hover:bg-ink hover:text-paper hover:border-ink
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
                                hover:bg-accent hover:text-paper
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
