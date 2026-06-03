import { Exercise } from "@/types/types";
import { exerciseService } from "@/services/exerciseService";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
    FaCircleInfo,
    FaChevronDown,
    FaLightbulb,
    FaPlay,
} from "react-icons/fa6";
import { useQueryClient } from "@tanstack/react-query";
import CodeMirror, { keymap, Prec } from "@uiw/react-codemirror";
import { PostgreSQL, sql } from "@codemirror/lang-sql";
import { createTheme } from "@uiw/codemirror-themes";
import { acceptCompletion } from "@codemirror/autocomplete";
import QueryResult from "../QueryResult";

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
    const queryClient = useQueryClient();

    const [queryValue, setQueryValue] = useState("");
    const [queryResult, setQueryResult] = useState<any>(null);
    const [queryError, setQueryError] = useState<string | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [expectedOutputOpen, setExpectedOutputOpen] = useState(false);

    const normalizedQuery = queryValue.toLowerCase();

    const missingRequirements = exercise.requirements?.filter(
        (req) => !normalizedQuery.includes(req.statement.toLowerCase()),
    );
    const queryMeetsRequirements = (missingRequirements?.length ?? 0) === 0;

    const handleRunQuery = async () => {
        if (!queryValue.trim()) return;

        if (!schemaName) {
            setQueryError(t("noSchemaLinkedError"));
            return;
        }

        if (!queryMeetsRequirements) {
            const list =
                missingRequirements
                    ?.map((r) => `"${r.statement}"`)
                    .join(", ") ?? "";
            setQueryError(t("missingSyntax", { list }));
            return;
        }

        try {
            setIsExecuting(true);
            setQueryError(null);
            setQueryResult(null);

            const submission = await exerciseService.submitSolution(
                exercise.exerciseId,
                queryValue,
            );

            if (submission.correct) {
                await queryClient.invalidateQueries({
                    queryKey: ["chapter", chapterId],
                });
            } else {
                setQueryError(submission.message);
            }

            setQueryResult(submission.queryResult);
        } catch (err) {
            setQueryError(
                err instanceof Error ? err.message : "Something went wrong",
            );
        } finally {
            setIsExecuting(false);
            onUpdate();
        }
    };

    return (
        <div className="flex flex-col gap-10">
            {/* Exercise prompt */}
            <p className="font-mono text-ink">{question}</p>

            {/* Expected output accordion */}
            {exercise.queryOutput && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-display text-2xl font-bold text-ink">
                                {t("expectedOutput")}
                            </h2>
                        </div>
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
                        result={{
                            type: "csv",
                            data: exercise.queryOutput,
                        }}
                        compact={!expectedOutputOpen}
                    />
                </div>
            )}

            {/* SQL editor */}
            <div>
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
                            onClick={() => setShowHint((h) => !h)}
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
                            {exercise.requirements.map((req) => {
                                const satisfied = normalizedQuery.includes(
                                    req.statement.toLowerCase(),
                                );
                                return (
                                    <div
                                        key={req.requirementId}
                                        className={`border px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
                                            satisfied
                                                ? "border-accent bg-accent text-paper"
                                                : "border-border bg-paper text-muted"
                                        }`}
                                    >
                                        {satisfied ? "✓ " : ""}
                                        {req.statement}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <CodeMirror
                    minHeight="200px"
                    value={queryValue}
                    onChange={(val) => setQueryValue(val)}
                    extensions={[
                        sql({ dialect: PostgreSQL }),
                        Prec.highest(
                            keymap.of([{ key: "Tab", run: acceptCompletion }]),
                        ),
                    ]}
                    basicSetup={{
                        lineNumbers: true,
                        highlightActiveLine: true,
                        autocompletion: true,
                        defaultKeymap: false,
                    }}
                    theme={createTheme({
                        theme: "light",
                        settings: {
                            background: "var(--color-paper)",
                            gutterBackground: "var(--color-surface-3)",
                            lineHighlight: "rgba(0, 0, 0, 0.06)",
                            gutterActiveForeground: "var(--color-ink)",
                            caret: "var(--color-accent)",
                            selection: "#b4d5fe",
                            selectionMatch: "transparent",
                        },
                        styles: [],
                    })}
                    className="border border-border text-sm"
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

                {queryResult && (
                    <QueryResult result={{ type: "csv", data: queryResult }} />
                )}
            </div>
        </div>
    );
}
