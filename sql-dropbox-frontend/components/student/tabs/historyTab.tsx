import { useTranslations } from "next-intl";

export default function HistoryTab() {
    const t = useTranslations("ChapterExercisePage");

    return (
        <div className="space-y-3">
            <h3 className="font-display text-2xl font-bold text-ink">
                {t("panel.history")}
            </h3>

            <div className="border border-dashed border-border bg-surface-2 px-6 py-10">
                <p className="font-mono text-sm text-muted text-center">
                    {t("noHistory")}
                </p>
            </div>
        </div>
    );
}
