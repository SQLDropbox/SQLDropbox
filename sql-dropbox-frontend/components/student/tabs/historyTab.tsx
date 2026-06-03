import { Exercise } from "@/types/types";
import { useTranslations } from "next-intl";
import { FaCheck, FaXmark } from "react-icons/fa6";

export default function HistoryTab({ exercise }: { exercise: Exercise }) {
    const t = useTranslations("ChapterExercisePage");

    const userExercise = exercise?.userExercises?.[0];
    const solutions = userExercise?.userSolutions ?? [];

    const sortedSolutions = [...solutions].sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat("en-GB", {
            dateStyle: "short",
            timeStyle: "short",
        }).format(new Date(dateString));
    };

    return (
        <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold text-ink">
                {t("panel.history")}
            </h3>

            {sortedSolutions.length === 0 ? (
                <div className="border border-dashed border-border bg-surface-2 px-6 py-10">
                    <p className="font-mono text-sm text-muted text-center">
                        {t("noHistory")}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sortedSolutions.map((s: any) => (
                        <div
                            key={s.userSolutionId}
                            className="border border-border bg-surface-2 p-4 shadow-[4px_4px_0px_0px_var(--color-border)]"
                        >
                            <div className="flex items-center justify-between mb-2">
                                {s.isCorrect ? (
                                    <div className="flex items-center gap-2 text-green-600 font-mono text-[10px] uppercase">
                                        <FaCheck className="inline-block" />
                                        <span>Correct</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-error font-mono text-[10px] uppercase">
                                        <FaXmark className="inline-block" />
                                        <span>Incorrect</span>
                                    </div>
                                )}
                                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                                    {formatDate(s.createdAt)}
                                </span>
                            </div>

                            <pre className="font-mono text-xs bg-paper border border-border p-3 overflow-x-auto">
                                {s.query}
                            </pre>

                            {s.errorMessage && (
                                <p className="mt-2 text-xs font-mono text-error">
                                    {s.errorMessage}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
