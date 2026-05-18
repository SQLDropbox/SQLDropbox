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
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
            onClick={() => onClose()}
        >
            <div
                className="w-full max-w-sm rounded-lg bg-white shadow-xl p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 mt-2">{description}</p>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={() => onClose()}
                        className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm()}
                        className={`${type === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"} text-white px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer`}
                    >
                        {type === "delete" ? "Delete" : "Confirm"}
                    </button>
                </div>
            </div>
        </div>
    );
}
