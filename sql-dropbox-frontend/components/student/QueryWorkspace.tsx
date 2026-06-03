import { Exercise } from "@/types/types";
import { exerciseService } from "@/services/exerciseService";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { FaCheck, FaLightbulb, FaPlay } from "react-icons/fa6";
import { useQueryClient } from "@tanstack/react-query";
import CodeMirror, { keymap, Prec } from "@uiw/react-codemirror";
import { PostgreSQL, sql } from "@codemirror/lang-sql";
import { createTheme } from "@uiw/codemirror-themes";
import { acceptCompletion } from "@codemirror/autocomplete";
import QueryResult from "./QueryResult";

type Props = {
    exercise: Exercise;
    schemaName: string;
    chapterId: string;
    onUpdate: () => void;
};

const CIRCUMFERENCE = 2 * Math.PI * 11;

function RequirementRing({ satisfied }: { satisfied: boolean }) {
    const offset = satisfied ? 0 : CIRCUMFERENCE;
    return (
        <div className="relative w-7 h-7 shrink-0">
            <svg
                viewBox="0 0 28 28"
                width="28"
                height="28"
                className="-rotate-90"
            >
                <circle
                    cx="14"
                    cy="14"
                    r="11"
                    fill="none"
                    strokeWidth="2.5"
                    className="stroke-border"
                    opacity="0.2"
                />
                <circle
                    cx="14"
                    cy="14"
                    r="11"
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    className="text-accent transition-[stroke-dashoffset] duration-500 ease-in-out"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={offset}
                />
            </svg>
            <span
                className={`absolute inset-0 flex items-center justify-center text-[10px] text-accent transition-all duration-300 ${
                    satisfied
                        ? "opacity-100 scale-100 delay-200"
                        : "opacity-0 scale-50"
                }`}
            >
                <FaCheck />
            </span>
        </div>
    );
}

export default function QueryWorkspace({
    exercise,
    schemaName,
    chapterId,
    onUpdate,
}: Props) {
    const t = useTranslations("ChapterExercisePage");
    const locale = useLocale();
    const queryClient = useQueryClient();

    const [queryValue, setQueryValue] = useState("");
    const [queryResult, setQueryResult] = useState<any>(null);
    const [queryError, setQueryError] = useState<string | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [showHint, setShowHint] = useState(false);

    const normalizedQuery = queryValue.toLowerCase();

    const satisfiedReqs = exercise.requirements?.map((req) => ({
        ...req,
        satisfied: normalizedQuery.includes(req.statement.toLowerCase()),
    }));

    const missingRequirements = satisfiedReqs?.filter((r) => !r.satisfied);
    const queryMeetsRequirements = (missingRequirements?.length ?? 0) === 0;
    const completedCount =
        satisfiedReqs?.filter((r) => r.satisfied).length ?? 0;
    const totalCount = satisfiedReqs?.length ?? 0;
    const progressPct =
        totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    const hint = locale === "nl" ? exercise.hintNL : exercise.hintEN;

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
            setShowHint(false);

            const submission = await exerciseService.submitSolution(
                exercise.exerciseId,
                queryValue,
            );

            if (submission.correct) {
                await queryClient.invalidateQueries({
                    queryKey: ["chapter", chapterId],
                });
            } else {
                setQueryError(formatErrorMessage(submission.message));
            }

            setQueryResult(submission.queryResult);
        } catch (err) {
            const rawMessage = err instanceof Error ? err.message : "Something went wrong";
            setQueryError(formatErrorMessage(rawMessage));
        } finally {
            setIsExecuting(false);
            onUpdate();
        }
    };

    const hasRequirements =
        exercise.requirements && exercise.requirements.length > 0;


    const formatErrorMessage = (rawMessage: string | null | undefined): string => {
    if (!rawMessage) return "Something went wrong";
        try {
            const parsed = JSON.parse(rawMessage);
            return parsed.message ? parsed.message : rawMessage;
        } catch {
            return rawMessage;
        }
    };    
    return (
        <div>
            <div className="flex">
                {/* Editor column */}
                <div className="border border-border flex-1">
                    <CodeMirror
                        minHeight="200px"
                        value={queryValue}
                        onChange={(val) => setQueryValue(val)}
                        extensions={[
                            sql({ dialect: PostgreSQL }),
                            Prec.highest(
                                keymap.of([
                                    { key: "Tab", run: acceptCompletion },
                                ]),
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
                        className="text-sm"
                    />
                </div>

                {/* Requirements sidebar */}
                {hasRequirements && (
                    <div className="w-48 shrink-0 border-l border-border ml-3 flex flex-col">
                        <div className="px-3 pt-4">
                            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-2">
                                {t("requiredSyntax")}
                            </p>
                            <div className="h-0.5 bg-border/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-accent transition-all duration-500 ease-in-out"
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                            <p className="font-mono text-[10px] text-muted mt-1.5 text-right">
                                {completedCount}/{totalCount}
                            </p>
                        </div>

                        <div className="flex flex-col flex-1">
                            {satisfiedReqs?.map((req, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 px-3 py-1"
                                >
                                    <RequirementRing
                                        satisfied={req.satisfied}
                                    />
                                    <span
                                        className={`font-mono text-xs uppercase tracking-widest transition-colors duration-300 ${
                                            req.satisfied
                                                ? "text-accent"
                                                : "text-muted"
                                        }`}
                                    >
                                        {req.statement}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {queryError && (
                <div className="border-l-4 border-error my-2 bg-surface-2 px-4 py-3 font-mono text-sm text-error mb-0">
                    {queryError}
                </div>
            )}

            {showHint && hint && (
                <div className="border-l-4 border-warning my-2 bg-surface-2 px-4 py-3 font-mono text-sm text-muted mb-0">
                    {hint}
                </div>
            )}

            <div className="flex items-center gap-3 py-2">
                <button
                    type="button"
                    onClick={handleRunQuery}
                    disabled={isExecuting || !queryMeetsRequirements}
                    className="inline-flex items-center gap-2 border-2 border-accent text-accent px-4 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-accent hover:text-paper transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <FaPlay />
                    {isExecuting ? t("running") : t("runQuery")}
                </button>

                {hint && (
                    <button
                        type="button"
                        onClick={() => setShowHint((h) => !h)}
                        className="inline-flex items-center gap-2 border-2 border-border text-muted px-4 py-2.5 font-mono text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition-colors"
                    >
                        <FaLightbulb />
                        {showHint ? t("hideHint") : t("showHint")}
                    </button>
                )}
            </div>

            {queryResult && (
                <QueryResult result={{ type: "csv", data: queryResult }} />
            )}
        </div>
    );
}
