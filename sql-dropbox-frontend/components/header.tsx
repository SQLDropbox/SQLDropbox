"use client";

import { useAuth } from "@/hooks/useAuth";
import { authUtils } from "@/utils/authUtils";
import LocaleSwitcher from "@/components/localeSwitcher";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// Feather / FA6 icons
import { FiSearch, FiLogOut, FiLogIn, FiMonitor } from "react-icons/fi";
import { FaGear } from "react-icons/fa6";

const toggleableRoutes: (string | RegExp)[] = [
    "/",
    "/admin",
    /^\/[^/]+$/,
    /^\/admin\/[^/]+$/,
];

export default function Header() {
    const { user, isAdmin, isLecturer } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isAdminRoute = pathname.startsWith("/admin");

    const canToggle = toggleableRoutes.some((route) =>
        typeof route === "string" ? pathname === route : route.test(pathname),
    );

    const toggleAdminMode = () => {
        if (isAdminRoute) {
            router.push(pathname.replace("/admin", "") || "/");
        } else {
            router.push(`/admin${pathname}`);
        }
    };

    const breadcrumbs = buildBreadcrumbs(pathname);

    function buildBreadcrumbs(pathname: string) {
        const segments = pathname.split("/").filter(Boolean);

        return segments.map((segment, index) => {
            const href = "/" + segments.slice(0, index + 1).join("/");

            // format label
            let label = segment;

            // make it readable
            if (!isNaN(Number(segment))) {
                label = `#${segment}`;
            } else {
                label = segment
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase());
            }

            return { href, label };
        });
    }

    return (
        <header className="w-full border-b-2 border-border bg-surface-1  shadow-sm relative">
            <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto gap-6">
                {/* Brand */}
                <Link
                    href="/"
                    className="font-display text-3xl font-bold text-accent uppercase tracking-tighter hover:opacity-80 transition-opacity"
                >
                    Databasement
                </Link>

                <nav className="flex grow items-center gap-2 font-mono text-sm text-muted">
                    {breadcrumbs.map((crumb, i) => (
                        <div
                            key={crumb.href}
                            className="flex items-center gap-2"
                        >
                            <Link
                                href={crumb.href}
                                className="hover:text-accent transition-colors"
                            >
                                {crumb.label}
                            </Link>

                            {i < breadcrumbs.length - 1 && (
                                <span className="text-border">›</span>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Controls */}
                <div className="flex items-center gap-4">
                    <LocaleSwitcher />

                    {/* Admin toggle */}
                    {(isAdmin || isLecturer) && canToggle && (
                        <button
                            onClick={toggleAdminMode}
                            className={`
                                flex items-center gap-2
                                font-mono text-sm border-2 px-4 py-2 uppercase tracking-widest transition-colors rotate-1
                                ${
                                    isAdminRoute
                                        ? "border-accent text-accent hover:bg-accent hover:text-paper"
                                        : "border-border text-muted hover:bg-border hover:text-paper"
                                }
                            `}
                        >
                            {isAdminRoute ? (
                                <FiMonitor className="text-[16px]" />
                            ) : (
                                <FaGear className="text-[16px]" />
                            )}
                            Admin
                        </button>
                    )}

                    {/* Auth */}
                    {user ? (
                        <button
                            onClick={() => authUtils.logout(router)}
                            className="flex items-center gap-2 font-mono text-sm border-2 border-accent text-accent px-4 py-2 hover:bg-accent hover:text-paper uppercase tracking-widest transition-colors rotate-1"
                        >
                            <FiLogOut className="text-[16px]" />
                            Log out
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center gap-2 font-mono text-sm border-2 border-accent text-accent px-4 py-2 hover:bg-accent hover:text-paper uppercase tracking-widest transition-colors rotate-1"
                        >
                            <FiLogIn className="text-[16px]" />
                            Log in
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
