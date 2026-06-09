"use client";

import { useTranslations } from "next-intl";

export default function LecturerTableHead() {
    const t = useTranslations("LecturerTableHead");

    return (
        <thead>
            <tr className="border-b-2 border-border divide-x divide-border bg-surface-1">
                <th className="p-3 font-display text-ink whitespace-nowrap w-48">
                    {t("lectorId")}
                </th>
                <th className="p-3 font-display text-ink whitespace-nowrap bg-surface-2">
                    {t("instructorName")}
                </th>
                <th className="p-3 font-display text-ink whitespace-nowrap w-48">
                    {t("role")}
                </th>
                <th className="p-3 font-display text-ink whitespace-nowrap w-16 text-center">
                    {t("actions")}
                </th>
            </tr>
        </thead>
    );
}