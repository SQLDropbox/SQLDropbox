import { Exercise } from "@/types/types";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import ExerciseTitleCard from "./exerciseCards/exerciseTitleCard";
import ExpectedOutputCard from "./exerciseCards/expectedOutputCard";
import ExerciseWorkspaceCard from "./exerciseCards/exerciseWorkspaceCard";
import DatabaseSchemaCard from "./exerciseCards/databaseSchemaCard";

type PanelTab = "question" | "schema" | "output";

const PANEL_TABS: { id: PanelTab; label: string }[] = [
    { id: "question", label: "Question" },
    { id: "schema", label: "Database Schema" },
    { id: "output", label: "Expected Output" },
];

export default function ExercisePanel({
    exercise,
    schemaName,
    schemaImage,
    chapterId,
    onUpdate,
}: {
    exercise: Exercise;
    chapterName: string;
    schemaName: string;
    schemaImage?: string | null;
    chapterId: string;
    onUpdate: () => void;
}) {
    const t = useTranslations("ChapterExercisePage");
    const [activeTab, setActiveTab] = useState<PanelTab>("question");
    const locale = useLocale();

    const question =
        locale === "nl"
            ? (exercise.questionNL ?? exercise.questionEN)
            : (exercise.questionEN ?? exercise.questionNL);

    return (
        <div className="space-y-6 bg-paper bg-ruled p-6">
            <div className="flex flex-wrap gap-2 border-b border-border pb-3">
                {PANEL_TABS.map(({ id }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setActiveTab(id)}
                        className={`px-4 py-2 border font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${
                            activeTab === id
                                ? "bg-paper border-border text-ink"
                                : "bg-surface-2 border-transparent text-muted hover:border-border hover:text-ink"
                        }`}
                    >
                        {t(`panel.${id}`)}
                    </button>
                ))}
            </div>

            <div className="">
                {activeTab === "question" && (
                    <>
                        <ExerciseTitleCard question={question} />

                        <ExerciseWorkspaceCard
                            exercise={exercise}
                            schemaName={schemaName}
                            chapterId={chapterId}
                            onUpdate={onUpdate}
                        />
                    </>
                )}

                {activeTab === "schema" && (
                    <DatabaseSchemaCard
                        schemaName={schemaName}
                        schemaImage={schemaImage}
                    />
                )}

                {activeTab === "output" && (
                    <ExpectedOutputCard exercise={exercise} />
                )}
            </div>
        </div>
    );
}
