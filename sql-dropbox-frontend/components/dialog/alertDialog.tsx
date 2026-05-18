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
        info: "bg-blue-600 hover:bg-blue-700",
        success: "bg-green-600 hover:bg-green-700",
        warning: "bg-yellow-600 hover:bg-yellow-700",
        error: "bg-red-600 hover:bg-red-700",
    };

    return (
        <div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm rounded-lg bg-white shadow-xl p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h3
                    className={`text-lg font-semibold`}
                >
                    {title}
                </h3>

                <p className="text-sm text-gray-500 mt-2">{description}</p>

                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg text-sm text-white transition-colors cursor-pointer ${typeStyles[type]}`}
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
}
