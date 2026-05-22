"use client";

interface Props {
    open: boolean;
    onClose: () => void;
    title: string;
    description: string;
    type?: "info" | "error" | "success" | "warning";
    buttonText?: string;
}

export default function AlertDialog({
    open,
    onClose,
    title,
    description,
    type = "info",
    buttonText = "OK",
}: Props) {
    if (!open) return null;

    const typeStyles = {
        info: "border-accent text-accent hover:bg-accent hover:text-paper",
        success: "border-green-500 text-green-600 hover:bg-green-500 hover:text-paper",
        warning: "border-yellow-600 text-yellow-700 hover:bg-yellow-600 hover:text-paper",
        error: "border-error text-error hover:bg-error hover:text-paper",
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={onClose}
        >
            {/* PAPER DIALOG */}
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
                <div className="border-t border-border px-5 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className={`
                            px-4 py-2
                            border-2
                            font-mono text-xs uppercase tracking-widest
                            transition-colors
                            ${typeStyles[type]}
                        `}
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
}
