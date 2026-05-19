import Link from "next/link";

export default function Header() {
    return (
        <nav className="border-b border-gray-200 bg-white px-4 flex justify-between items-center h-16">
            <Link
                href="/"
                className="flex items-center px-2 text-gray-900 font-semibold text-lg"
            >
                Databasement
            </Link>
            <Link
                href="/login"
                className="flex items-center px-4 py-2 border border-blue-600 rounded-md hover:bg-blue-100 transition-colors"
            >
                Log in
            </Link>
            <Link
                href="/admin"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
                Admin
            </Link>
        </nav>
    );
}
