import { useAuth } from "@/hooks/useAuth";
import { authUtils } from "@/utils/authUtils";
import LocaleSwitcher from "@/components/localeSwitcher";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaCog, FaDesktop } from "react-icons/fa";

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

    return (
        <nav className="border-b border-gray-200 bg-white px-4 flex justify-between items-center h-16 gap-8">
            <Link
                href="/"
                className="flex items-center px-2 text-gray-900 font-semibold text-lg"
            >
                Databasement
            </Link>
            <div className="flex gap-3 items-center">
                <LocaleSwitcher />

                {(isAdmin || isLecturer) && canToggle && (
                    <button
                        onClick={toggleAdminMode}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border transition
                    ${
                        isAdminRoute
                            ? "bg-purple-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            : "bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100"
                    }`}
                    >
                        {isAdminRoute ? <FaDesktop /> : <FaCog />}
                        Admin
                    </button>
                )}

                {user ? (
                    <button
                        onClick={() => authUtils.logout(router)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border transition bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100"
                    >
                        Log out
                    </button>
                ) : (
                    <Link
                        href="/login"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border transition bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100"
                    >
                        Log in
                    </Link>
                )}
            </div>
        </nav>
    );
}
