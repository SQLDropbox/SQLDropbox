import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const locales = ["en", "nl"];

export default function LocaleSwitcher() {
    const router = useRouter();
    const locale = useLocale();
    const [open, setOpen] = useState(false);

    const switchLocale = (next: string) => {
        document.cookie = `NEXT_LOCALE=${next}; path=/`;
        setOpen(false);
        router.refresh();
    };

    return (
        <div className="relative inline-block">
            {/* Trigger */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="
                    flex items-center gap-1
                    font-mono text-sm
                    text-ink
                    border-b-2 border-accent
                    px-2 py-1
                    hover:text-accent
                    transition-colors
                "
            >
                {locale.toUpperCase()}
                <FiChevronDown className="text-[12px]" />
            </button>

            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Dropdown */}
            {open && (
                <div
                    className="
                        absolute right-0 mt-2
                        w-24
                        bg-paper
                        border border-border
                        shadow-sm
                        z-50
                    "
                >
                    {locales.map((code) => (
                        <button
                            key={code}
                            onClick={() => switchLocale(code)}
                            className={`
                                w-full px-3 py-2
                                text-left font-mono text-sm
                                hover:bg-accent hover:text-paper
                                transition-colors
                                ${
                                    locale === code
                                        ? "text-accent font-bold"
                                        : "text-ink"
                                }
                            `}
                        >
                            {code.toUpperCase()}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
