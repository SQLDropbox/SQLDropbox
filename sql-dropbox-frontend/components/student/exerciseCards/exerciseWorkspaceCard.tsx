import { Exercise } from "@/types/types";
import QueryResult from "../QueryResult";
import { queryService } from "@/services/queryService";
import { exerciseService } from "@/services/exerciseService";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FaCircleInfo, FaLightbulb, FaPlay } from "react-icons/fa6";
import { useQueryClient } from "@tanstack/react-query";

export default function ExerciseWorkspaceCard({
    exercise,
    schemaName,
    chapterId,
}: {
    exercise: Exercise;
    schemaName: string;
    chapterId: string;
}) {
    const t = useTranslations("ChapterExercisePage");
    const [showHint, setShowHint] = useState(false);
    const [queryValue, setQueryValue] = useState("");
    const [queryResult, setQueryResult] = useState<any>(null);
    const [queryError, setQueryError] = useState<string | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const queryClient = useQueryClient();

    const normalizedQuery = queryValue.toLowerCase();

    const missingRequirements = exercise.requirements?.filter(
        (requirement) =>
            !normalizedQuery.includes(requirement.statement.toLowerCase()),
    );

    const queryMeetsRequirements = missingRequirements?.length === 0;

    const handleRunQuery = async () => {
        if (!queryValue.trim()) return;

        if (!schemaName) {
            setQueryError(t("noSchemaLinkedError"));
            return;
        }

        if (!queryMeetsRequirements) {
            const list = missingRequirements ? missingRequirements
                .map((r) => `"${r.statement}"`)
                .join(", ") : "";
            setQueryError(t("missingSyntax", { list }));
            return;
        }

        try {
            setIsExecuting(true);
            setQueryError(null);
            setQueryResult(null);

            // 1. run SQL (for preview output)
            const preview = await queryService.executeQuery({
                schema: schemaName,
                query: queryValue,
            });

            setQueryResult(preview);

            // 2. submit for validation
            const submission = await exerciseService.submitSolution(
                exercise.exerciseId,
                queryValue,
            );

            if (submission.correct) {
                queryClient.invalidateQueries({
                    queryKey: ["chapter", chapterId],
                });
            } else {
                setQueryError(submission.message);
            }
        } catch (err) {
            setQueryError(
                err instanceof Error ? err.message : "Something went wrong",
            );
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="bg-paper border border-border p-6 shadow-[0px_-3px_0px_0px_var(--color-border)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-2">
                        {t("workspaceLabel")}
                    </p>
                    <h3 className="font-display text-2xl font-bold text-ink">
                        {t("yourSqlQuery")}
                    </h3>
                </div>

                {exercise.hintNL && (
                    <button
                        type="button"
                        onClick={() => setShowHint((current) => !current)}
                        className="inline-flex items-center gap-2 border-2 border-accent text-accent px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-accent hover:text-paper transition-colors"
                    >
                        <FaLightbulb />
                        {showHint ? t("hideHint") : t("showHint")}
                    </button>
                )}
            </div>

            {showHint && exercise.hintNL && (
                <div className="border border-border bg-warning px-4 py-3 font-mono text-sm text-muted">
                    {exercise.hintNL}
                </div>
            )}

            {exercise.requirements && exercise.requirements.length > 0 && (
                <div className="border border-border bg-surface-2 px-4 py-4">
                    <div className="flex items-center gap-2 mb-3">
                        <FaCircleInfo className="text-accent text-sm" />
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                            {t("requiredSyntax")}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {exercise.requirements?.map((requirement) => {
                            const isSatisfied = normalizedQuery.includes(
                                requirement.statement.toLowerCase(),
                            );

                            return (
                                <div
                                    key={requirement.requirementId}
                                    className={`border px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
                                        isSatisfied
                                            ? "border-accent bg-accent text-paper"
                                            : "border-border bg-paper text-muted"
                                    }`}
                                >
                                    {isSatisfied ? "✓ " : ""}
                                    {requirement.statement}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <textarea
                value={queryValue}
                onChange={(event) => setQueryValue(event.target.value)}
                placeholder={t("textareaPlaceholder")}
                rows={12}
                spellCheck={false}
                className="min-h-64 w-full border border-border bg-surface-2 px-5 py-4 font-mono text-sm text-ink outline-none transition focus:border-accent"
            />

            <button
                type="button"
                onClick={handleRunQuery}
                disabled={isExecuting || !queryMeetsRequirements}
                className="inline-flex items-center gap-2 border-2 border-accent text-accent px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-accent hover:text-paper transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <FaPlay />
                {isExecuting ? t("running") : t("runQuery")}
            </button>

            {queryError && (
                <div className="border border-error bg-paper px-4 py-3 font-mono text-sm text-error">
                    {queryError}
                </div>
            )}

            {queryResult && <QueryResult result={queryResult} />}
        </div>
    );
}
