import { Exercise } from "@/types/types";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import QueryResult from "../QueryResult";
import QueryWorkspace from "../QueryWorkspace";

export default function QuestionTab({
    exercise,
    question,
    schemaName,
    chapterId,
    onUpdate,
}: {
    exercise: Exercise;
    question: string;
    schemaName: string;
    chapterId: string;
    onUpdate: () => void;
}) {
    const t = useTranslations("ChapterExercisePage");
    const [expectedOutputOpen, setExpectedOutputOpen] = useState(false);

    return (
        <div className="flex flex-col gap-10">
            <p className="font-mono text-ink">{question}</p>

            {exercise.queryOutput && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <h2 className="font-mono font-bold text-ink">
                            {t("expectedOutput")}
                        </h2>
                        <button
                            type="button"
                            onClick={() => setExpectedOutputOpen((o) => !o)}
                            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted hover:text-ink transition-colors"
                        >
                            {expectedOutputOpen ? t("collapse") : t("expand")}
                            <FaChevronDown
                                className={`text-xs transition-transform duration-200 ${
                                    expectedOutputOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>
                    </div>
                    <QueryResult
                        result={{ type: "csv", data: exercise.queryOutput }}
                        compact={!expectedOutputOpen}
                    />
                </div>
            )}

            <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-2">
                    {t("workspaceLabel")}
                </p>
                <h3 className="font-mono font-bold text-ink mb-1">
                    {t("yourSqlQuery")}
                </h3>

                <QueryWorkspace
                    exercise={exercise}
                    schemaName={schemaName}
                    chapterId={chapterId}
                    onUpdate={onUpdate}
                />
            </div>
        </div>
    );
}
