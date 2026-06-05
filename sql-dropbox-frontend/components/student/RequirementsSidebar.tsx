import { useTranslations } from "next-intl";
import { FaCheck, FaX } from "react-icons/fa6";
import { Requirement } from "@/types/types";

const CIRCUMFERENCE = 2 * Math.PI * 11;

type SatisfiedRequirement = Requirement & { satisfied: boolean };

function RequirementRing({ satisfied, isBlacklist }: { satisfied: boolean; isBlacklist?: boolean }) {
    const isFailedBlacklist = isBlacklist && !satisfied;
    
    const showFullRing = satisfied || isFailedBlacklist;
    const ringOffset = showFullRing ? 0 : CIRCUMFERENCE;

    return (
        <div className="relative w-7 h-7 shrink-0">
            <svg viewBox="0 0 28 28" width="28" height="28" className="-rotate-90">
                <circle
                    cx="14" cy="14" r="11" fill="none" strokeWidth="2.5"
                    className="stroke-border" opacity="0.2"
                />
                <circle
                    cx="14" cy="14" r="11" fill="none" strokeWidth="2.5" strokeLinecap="round" stroke="currentColor"
                    className={`${isFailedBlacklist ? "text-error" : "text-accent"} transition-all duration-500 ease-in-out`}
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={ringOffset}
                />
            </svg>
            
            {/* Vinkje (Bij succesvolle whitelist of succesvol vermeden blacklist) */}
            <span
                className={`absolute inset-0 flex items-center justify-center text-[10px] transition-all duration-300 ${
                    satisfied
                        ? "opacity-100 scale-100 delay-200 text-accent"
                        : "opacity-0 scale-50"
                }`}
            >
                <FaCheck />
            </span>

            {/* Kruisje (Enkel bij gefaalde blacklist) */}
            <span
                className={`absolute inset-0 flex items-center justify-center text-[10px] transition-all duration-300 ${
                    isFailedBlacklist
                        ? "opacity-100 scale-100 delay-200 text-error"
                        : "opacity-0 scale-50"
                }`}
            >
                <FaX />
            </span>
        </div>
    );
}

function RequirementSection({
    title,
    requirements,
    isBlacklist = false
}: {
    title: string;
    requirements: SatisfiedRequirement[];
    isBlacklist?: boolean;
}) {
    if (requirements.length === 0) return null;

    return (
        <div className="mt-4">
            <p className="px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-2">
                {title}
            </p>
            {requirements.map((req) => {
                const textClass = req.satisfied 
                    ? "text-accent" 
                    : isBlacklist 
                        ? "text-error" 
                        : "text-muted";

                return (
                    <div key={req.statement} className="flex items-center gap-3 px-3 py-1">
                        <RequirementRing satisfied={req.satisfied} isBlacklist={isBlacklist} />
                        <span className={`font-mono text-xs uppercase tracking-widest transition-colors duration-300 ${textClass}`}>
                            {req.statement}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

type Props = {
    satisfiedReqs: SatisfiedRequirement[];
};

export default function RequirementsSidebar({ satisfiedReqs }: Props) {
    const t = useTranslations("ChapterExercisePage");

    const visibleReqs = satisfiedReqs?.filter((r) => !r.isHidden) || [];

    if (visibleReqs.length === 0) return null;

    const whitelistReqs = visibleReqs.filter((r) => !r.isBlacklist);
    const blacklistReqs = visibleReqs.filter((r) => r.isBlacklist);

    const totalWhitelistCount = whitelistReqs.length;
    const completedWhitelistCount = whitelistReqs.filter((r) => r.satisfied).length;
    const progressPct = totalWhitelistCount > 0 ? (completedWhitelistCount / totalWhitelistCount) * 100 : 0;

    return (
        <div className="w-48 shrink-0 border-l border-border ml-3 flex flex-col">
            
            {/* Progress bar (Enkel bij meer dan 1 whitelist item) */}
            {totalWhitelistCount > 1 && (
                <div className="px-3 pt-4 mb-2">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-2">
                        {t("progress") || "PROGRESS"}
                    </p>
                    <div className="h-0.5 bg-border/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-accent transition-all duration-500 ease-in-out"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                    <p className="font-mono text-[10px] text-muted mt-1.5 text-right">
                        {completedWhitelistCount}/{totalWhitelistCount}
                    </p>
                </div>
            )}

            {/* Requirement Lijsten */}
            <div className="flex flex-col flex-1 pb-4">
                <RequirementSection 
                    title={t("requiredSyntax") || "REQUIRED SYNTAX"} 
                    requirements={whitelistReqs} 
                />
                
                <RequirementSection 
                    title={t("forbiddenSyntax") || "FORBIDDEN SYNTAX"} 
                    requirements={blacklistReqs} 
                    isBlacklist 
                />
            </div>
        </div>
    );
}