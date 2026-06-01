import { Exercise } from "@/types/types";
import { useTranslations } from "next-intl";
import QueryResult from "../QueryResult";

export default function ExpectedOutputCard({
    exercise,
}: {
    exercise: Exercise;
}) {
    const t = useTranslations("ChapterExercisePage");

    return (
        <div className="space-y-3">
            <h3 className="font-display text-2xl font-bold text-ink">
                {t("panel.output")}
            </h3>

            <div className="min-h-40 border border-dashed border-border bg-surface-2 p-4">
                {exercise.queryOutput ? (
                    <QueryResult
                        result={{ type: "csv", data: exercise.queryOutput }}
                    />
                ) : (
                    <p className="font-mono text-sm text-muted">
                        {t("noExpectedOutput")}
                    </p>
                )}
            </div>
        </div>
    );
}
