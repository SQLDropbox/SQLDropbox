import { Exercise } from "@/types/types";
import { useTranslations } from "next-intl";

export default function exerciseTitleCard({ question }: { question: string }) {
    const t = useTranslations("ChapterExercisePage");

    return (
        <div className="bg-paper border border-border shadow-[0px_-3px_0px_0px_var(--color-border)] p-6">
            <p className=" font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-2">
                {t("exercisePrompt")}
            </p>
            <h3 className="font-display text-2xl font-bold text-ink">
                {question}
            </h3>
        </div>
    );
}
