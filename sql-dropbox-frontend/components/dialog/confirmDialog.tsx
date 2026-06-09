"use client";

interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: React.ReactNode;
    type: "delete" | "confirm";
}

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    type,
}: Props) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={onClose}
        >
            {/* DOCUMENT CARD */}
            <div
                className="
                    w-full max-w-sm
                    bg-paper-light
                    border border-border
                    shadow-2xl
                    font-mono
                    text-ink
                    rotate-[-0.5deg]
                "
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="border-b border-border px-5 py-4 bg-paper">
                    <h3 className="text-sm uppercase tracking-widest font-semibold">
                        {title}
                    </h3>
                </div>

                {/* BODY */}
                <div className="px-5 py-4">
                    <p className="text-sm text-muted leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* FOOTER */}
                <div className="border-t border-border px-5 py-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="
                            px-4 py-2
                            border border-border
                            text-muted
                            font-mono text-xs uppercase tracking-widest
                            hover:bg-ink hover:text-paper
                            transition-colors
                        "
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        className={`
                            px-4 py-2
                            border-2
                            font-mono text-xs uppercase tracking-widest
                            transition-colors
                            ${
                                type === "delete"
                                    ? "border-error text-error hover:bg-error hover:text-paper"
                                    : "border-accent text-accent hover:bg-accent hover:text-paper"
                            }
                        `}
                    >
                        {type === "delete" ? "Delete" : "Confirm"}
                    </button>
                </div>
            </div>
        </div>
    );
}