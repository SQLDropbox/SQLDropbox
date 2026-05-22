import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

const locales = ["en", "nl"];

export default function LocaleSwitcher() {
    const router = useRouter();
    const locale = useLocale();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const switchLocale = (next: string) => {
        document.cookie = `NEXT_LOCALE=${next}; path=/`;
        setDropdownOpen(false);
        router.refresh();
    };

    return (
        <div className="relative">
            <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors text-sm font-medium text-gray-600 hover:text-gray-900"
            >
                {locale.toUpperCase()}
                <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {dropdownOpen && (
                <>
                    <div
                        className="fixed inset-0"
                        onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-1 w-fit bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        {locales.map((code) => (
                            <button
                                key={code}
                                onClick={() => switchLocale(code)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                                    locale === code
                                        ? "font-semibold text-blue-600"
                                        : "text-gray-700"
                                }`}
                            >
                                {code.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
