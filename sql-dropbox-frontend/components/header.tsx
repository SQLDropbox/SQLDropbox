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
        <nav className="border-b border-gray-200 bg-white px-4 flex justify-between items-center h-16 gap-4">
            <Link
                href="/"
                className="flex items-center px-2 text-gray-900 font-semibold text-lg"
            >
                Databasement
            </Link>
            <div className="flex gap-4 items-center">
                {(isAdmin || isLecturer) && canToggle && (
                    <button
                        onClick={toggleAdminMode}
                        className="text-blue-600 hover:text-blue-800 text-xl cursor-pointer transition-colors"
                    >
                        {isAdminRoute ? <FaDesktop /> : <FaCog />}
                    </button>
                )}

                <LocaleSwitcher />

                {user ? (
                    <button
                        onClick={() => authUtils.logout(router)}
                        className="flex items-center px-4 py-2 border border-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                    >
                        Log out
                    </button>
                ) : (
                    <Link
                        href="/login"
                        className="flex items-center px-4 py-2 border border-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                    >
                        Log in
                    </Link>
                )}
            </div>
        </nav>
    );
}
