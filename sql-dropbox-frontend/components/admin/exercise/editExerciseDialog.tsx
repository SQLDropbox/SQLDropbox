"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useParams } from "next/navigation";
import {
    Exercise,
    QueryAction,
    Requirement,
    RequirementDTO,
} from "@/types/types";
import { exerciseService } from "@/services/exerciseService";
import ConfirmDialog from "@/components/dialog/confirmDialog";
import AlertDialog from "@/components/dialog/alertDialog";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";
import { FiTrash2, FiPlus } from "react-icons/fi";

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    mode: "add" | "edit";
    exercise?: Exercise;
}

type FormErrors = Partial<Record<keyof Exercise, string>>;

// Local draft type for requirements before they have a real requirementId
interface RequirementDraft {
    _localId: string;
    statement: string;
    isBlacklist: boolean;
    hidden: boolean;
}

const emptyForm: Omit<Exercise, "exerciseId"> = {
    questionNL: "",
    questionEN: "",
    hintNL: "",
    hintEN: "",
    queryOutput: "",
    queryAction: QueryAction.Select,
    chapterId: 0,
};

export default function EditExerciseDialog({
    open,
    onClose,
    onSuccess,
    mode,
    exercise,
}: Props) {
    const isEdit = mode === "edit";
    const t = useTranslations("ExerciseDialog");
    const { isAdmin } = useAuth();
    const params = useParams();
    const chapterId = Number(params?.chapterId ?? 0);

    const [form, setForm] = useState<Omit<Exercise, "exerciseId">>({
        ...emptyForm,
        chapterId,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitted, setSubmitted] = useState(false);
    const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] =
        useState(false);
    const [errorDialog, setErrorDialog] = useState<string | null>(null);
    const [requirements, setRequirements] = useState<RequirementDraft[]>([]);

    function validateForm(f: Omit<Exercise, "exerciseId">): FormErrors {
        const errs: FormErrors = {};
        if (!f.questionEN.trim())
            errs.questionEN = t("errors.questionENRequired");
        if (!f.questionNL.trim())
            errs.questionNL = t("errors.questionNLRequired");
        return errs;
    }

    useEffect(() => {
        if (!open) return;
        setErrors({});
        setSubmitted(false);

        if (isEdit && exercise) {
            setForm({
                chapterId: exercise.chapterId,
                questionNL: exercise.questionNL,
                questionEN: exercise.questionEN,
                hintNL: exercise.hintNL,
                hintEN: exercise.hintEN,
                queryOutput: exercise.queryOutput,
                queryAction: exercise.queryAction,
                solutionQuery: exercise.solutionQuery,
                validationQuery: exercise.validationQuery,
            });
            setRequirements(
                (exercise.requirements ?? []).map((r) => ({
                    _localId: String(r.requirementId),
                    statement: r.statement,
                    isBlacklist: r.isBlacklist,
                    hidden: r.hidden,
                })),
            );
        } else {
            setForm({ ...emptyForm, chapterId });
            setRequirements([]);
        }
    }, [open, mode, exercise, chapterId]);

    if (!open) return null;

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) {
        const { name, value } = e.target;
        const updated = { ...form, [name]: value };
        setForm(updated);

        if (submitted) {
            const newErrors = validateForm(updated);
            setErrors((prev) => ({
                ...prev,
                [name]: newErrors[name as keyof Exercise],
            }));
        }
    }

    async function handleSubmit() {
        setSubmitted(true);
        const newErrors = validateForm(form);
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            if (isEdit && exercise?.exerciseId != null) {
                await exerciseService.updateExercise(exercise.exerciseId, form);
            } else {
                await exerciseService.addExercise(form);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setErrorDialog(err?.message || t("errors.saveFailed"));
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="relative w-full max-w-170 bg-paper-light text-ink border border-border shadow-2xl flex flex-col max-h-[90vh] font-mono">
                {/* HEADER STRIP */}
                <div className="border-b border-border bg-paper px-6 py-4 flex justify-between items-start shrink-0">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted">
                            {t("headerStamp")}
                        </p>
                        <h2 className="font-display text-xl">
                            {isEdit ? t("titleEdit") : t("titleAdd")}
                        </h2>
                        <p className="text-[11px] text-muted mt-1">
                            {isEdit ? t("subtitleEdit") : t("subtitleAdd")}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="opacity-70 hover:opacity-100 transition"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* CHAPTER ID STAMP */}
                <div className="absolute top-6 right-14 -rotate-12 border-2 border-border px-3 py-1 text-[10px] uppercase tracking-widest text-muted opacity-60">
                    ch-{chapterId}
                </div>

                {/* FORM BODY */}
                <div className="flex flex-col grow overflow-y-auto gap-2 px-6">
                    {/* QUESTION */}
                    <Field
                        label={t("question")}
                        error={errors.questionEN || errors.questionNL}
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <span className="absolute right-1 top-1 text-[10px] text-muted z-10">
                                    EN
                                </span>
                                <textarea
                                    name="questionEN"
                                    value={form.questionEN}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full bg-transparent border border-border p-2 pr-6 text-sm resize-none focus:border-accent outline-none"
                                />
                            </div>
                            <div className="relative">
                                <span className="absolute right-1 top-1 text-[10px] text-muted z-10">
                                    NL
                                </span>
                                <textarea
                                    name="questionNL"
                                    value={form.questionNL}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full bg-transparent border border-border p-2 pr-6 text-sm resize-none focus:border-accent outline-none"
                                />
                            </div>
                        </div>
                    </Field>

                    {/* HINT */}
                    <Field label={t("hint")}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <span className="absolute right-1 top-1 text-[10px] text-muted z-10">
                                    EN
                                </span>
                                <textarea
                                    name="hintEN"
                                    value={form.hintEN}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full bg-transparent border border-border p-2 pr-6 text-sm resize-none focus:border-accent outline-none"
                                />
                            </div>
                            <div className="relative">
                                <span className="absolute right-1 top-1 text-[10px] text-muted z-10">
                                    NL
                                </span>
                                <textarea
                                    name="hintNL"
                                    value={form.hintNL}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full bg-transparent border border-border p-2 pr-6 text-sm resize-none focus:border-accent outline-none"
                                />
                            </div>
                        </div>
                    </Field>

                    {/* QUERY ACTION */}
                    <Field label={t("queryAction")}>
                        <div className="flex gap-6">
                            {(
                                [
                                    {
                                        label: "SELECT",
                                        value: QueryAction.Select,
                                    },
                                    {
                                        label: "MANIPULATION",
                                        value: QueryAction.Insert,
                                    },
                                ] as const
                            ).map(({ label, value }) => (
                                <label
                                    key={value}
                                    className="flex items-center gap-2 cursor-pointer group"
                                >
                                    <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
                                        <input
                                            type="radio"
                                            name="queryAction"
                                            checked={
                                                value === QueryAction.Select
                                                    ? form.queryAction ===
                                                      QueryAction.Select
                                                    : form.queryAction !==
                                                      QueryAction.Select
                                            }
                                            onChange={() =>
                                                setForm((p) => ({
                                                    ...p,
                                                    queryAction: value,
                                                }))
                                            }
                                            className="peer appearance-none w-4 h-4 border-2 border-border checked:border-accent cursor-pointer transition-colors rounded-none"
                                        />
                                        <div className="absolute w-2 h-2 bg-accent scale-0 peer-checked:scale-100 transition-transform pointer-events-none" />
                                    </div>
                                    <span className="font-mono text-[11px] uppercase tracking-wider text-ink group-hover:translate-x-1 transition-transform">
                                        {label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </Field>

                    {/* SOLUTION QUERY */}
                    <Field
                        label={t("solutionQuery")}
                        error={errors.solutionQuery}
                    >
                        <textarea
                            name="solutionQuery"
                            value={form.solutionQuery ?? ""}
                            onChange={handleChange}
                            rows={5}
                            placeholder="SELECT ..."
                            className="w-full bg-transparent border border-border p-2 text-sm resize-none focus:border-accent outline-none font-mono placeholder:text-muted/40"
                        />
                        <button
                            type="button"
                            disabled
                            className="mt-2 px-3 py-1.5 border border-border text-[11px] uppercase tracking-widest text-muted opacity-40 cursor-not-allowed"
                            title={t("previewComingSoon")}
                        >
                            {t("preview")} →
                        </button>
                    </Field>

                    {/* REQUIREMENTS */}
                    <div className="py-4 border-t border-border">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-[11px] uppercase tracking-widest text-muted">
                                {t("requirements")}
                            </label>
                            <button
                                type="button"
                                onClick={() =>
                                    setRequirements((prev) => [
                                        ...prev,
                                        {
                                            _localId: crypto.randomUUID(),
                                            statement: "",
                                            isBlacklist: false,
                                            hidden: false,
                                        },
                                    ])
                                }
                                className="flex items-center gap-1.5 px-2 py-1 border border-accent text-accent text-[11px] uppercase tracking-widest hover:bg-accent hover:text-paper transition"
                            >
                                <FiPlus className="text-[12px]" />
                                {t("addRequirement")}
                            </button>
                        </div>

                        {requirements.length === 0 ? (
                            <p className="text-[11px] text-muted italic uppercase tracking-widest py-3 border border-dashed border-border text-center">
                                {t("noRequirements")}
                            </p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {requirements.map((req) => (
                                    <div
                                        key={req._localId}
                                        className="flex gap-3 border border-border bg-surface-1 px-3 py-2"
                                    >
                                        {/* LEFT: two rows */}
                                        <div className="flex flex-col gap-2 flex-1 min-w-0">
                                            {/* ROW 1 — STATEMENT */}
                                            <input
                                                type="text"
                                                value={req.statement}
                                                onChange={(e) =>
                                                    setRequirements((prev) =>
                                                        prev.map((r) =>
                                                            r._localId ===
                                                            req._localId
                                                                ? {
                                                                      ...r,
                                                                      statement:
                                                                          e
                                                                              .target
                                                                              .value,
                                                                  }
                                                                : r,
                                                        ),
                                                    )
                                                }
                                                placeholder={t(
                                                    "requirementName",
                                                )}
                                                className="w-full bg-transparent border-b border-border focus:border-accent outline-none text-sm py-0.5 placeholder:text-muted/40"
                                            />

                                            {/* ROW 2 — WHITELIST/BLACKLIST + HIDDEN */}
                                            <div className="flex items-center gap-3">
                                                {/* WHITELIST / BLACKLIST TOGGLE */}
                                                <div className="flex items-center border border-border shrink-0">
                                                    {[
                                                        {
                                                            label: t(
                                                                "whitelist",
                                                            ),
                                                            isBlacklist: false,
                                                        },
                                                        {
                                                            label: t(
                                                                "blacklist",
                                                            ),
                                                            isBlacklist: true,
                                                        },
                                                    ].map(
                                                        ({
                                                            label,
                                                            isBlacklist,
                                                        }) => (
                                                            <button
                                                                key={String(
                                                                    isBlacklist,
                                                                )}
                                                                type="button"
                                                                onClick={() =>
                                                                    setRequirements(
                                                                        (
                                                                            prev,
                                                                        ) =>
                                                                            prev.map(
                                                                                (
                                                                                    r,
                                                                                ) =>
                                                                                    r._localId ===
                                                                                    req._localId
                                                                                        ? {
                                                                                              ...r,
                                                                                              isBlacklist,
                                                                                          }
                                                                                        : r,
                                                                            ),
                                                                    )
                                                                }
                                                                className={`
                                                                px-2 py-1 text-[10px] uppercase tracking-widest transition
                                                                ${
                                                                    req.isBlacklist ===
                                                                    isBlacklist
                                                                        ? isBlacklist
                                                                            ? "bg-error text-paper"
                                                                            : "bg-accent text-paper"
                                                                        : "text-muted hover:text-ink"
                                                                }
                                                            `}
                                                            >
                                                                {label}
                                                            </button>
                                                        ),
                                                    )}
                                                </div>

                                                {/* HIDDEN CHECKBOX */}
                                                <label className="flex items-center gap-1.5 cursor-pointer group">
                                                    <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
                                                        <input
                                                            type="checkbox"
                                                            checked={req.hidden}
                                                            onChange={(e) =>
                                                                setRequirements(
                                                                    (prev) =>
                                                                        prev.map(
                                                                            (
                                                                                r,
                                                                            ) =>
                                                                                r._localId ===
                                                                                req._localId
                                                                                    ? {
                                                                                          ...r,
                                                                                          hidden: e
                                                                                              .target
                                                                                              .checked,
                                                                                      }
                                                                                    : r,
                                                                        ),
                                                                )
                                                            }
                                                            className="peer appearance-none w-4 h-4 border-2 border-border checked:bg-accent checked:border-accent cursor-pointer transition-colors"
                                                        />
                                                        <svg
                                                            className="absolute text-paper pointer-events-none opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-transform w-2.5 h-2.5"
                                                            viewBox="0 0 10 10"
                                                            fill="none"
                                                        >
                                                            <path
                                                                d="M1.5 5l2.5 2.5 4.5-5"
                                                                stroke="currentColor"
                                                                strokeWidth="1.8"
                                                                strokeLinecap="square"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <span className="text-[10px] uppercase tracking-widest text-muted group-hover:text-ink transition">
                                                        {t("hidden")}
                                                    </span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* RIGHT — DELETE (vertically centered) */}
                                        <div className="flex items-center shrink-0">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setRequirements((prev) =>
                                                        prev.filter(
                                                            (r) =>
                                                                r._localId !==
                                                                req._localId,
                                                        ),
                                                    )
                                                }
                                                className="w-7 h-7 flex items-center justify-center border border-border text-muted hover:border-error hover:text-error transition"
                                            >
                                                <FiTrash2 className="text-[12px]" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER CONTROL STRIP */}
                <div className="border-t border-border bg-surface-1 px-6 py-4 flex justify-between gap-3 shrink-0">
                    <div>
                        {isAdmin && isEdit && (
                            <button
                                onClick={() => setConfirmDeleteDialogOpen(true)}
                                className="
                                    flex items-center justify-center
                                    w-9 h-9
                                    border border-error
                                    text-ink
                                    hover:bg-error hover:text-paper
                                    transition
                                    -rotate-1
                                "
                                title={t("delete")}
                            >
                                <FiTrash2 className="text-[14px]" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-border text-muted hover:bg-ink hover:text-paper transition"
                        >
                            {t("cancel")}
                        </button>

                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 border-2 border-accent text-accent hover:bg-accent hover:text-paper transition rotate-1"
                        >
                            {isEdit ? t("save") : t("create")}
                        </button>
                    </div>
                </div>
            </div>

            <AlertDialog
                open={!!errorDialog}
                onClose={() => setErrorDialog(null)}
                title={t("errorTitle")}
                description={errorDialog || ""}
                type="error"
                buttonText={t("ok")}
            />

            <ConfirmDialog
                open={confirmDeleteDialogOpen}
                onClose={() => setConfirmDeleteDialogOpen(false)}
                onConfirm={async () => {
                    if (!exercise?.exerciseId) return;
                    await exerciseService.deleteExercise(exercise.exerciseId);
                    setConfirmDeleteDialogOpen(false);
                    onSuccess();
                    onClose();
                }}
                title={t("deleteTitle")}
                description={t("deleteDescription")}
                type="delete"
            />
        </div>
    );
}

/* ------------------------ field block ------------------------ */
function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="py-4">
            <label className="text-[11px] uppercase tracking-widest text-muted block mb-1">
                {label}
            </label>
            {children}
            {error && (
                <p className="text-[11px] text-error mt-1 uppercase tracking-wider">
                    {error}
                </p>
            )}
        </div>
    );
}
