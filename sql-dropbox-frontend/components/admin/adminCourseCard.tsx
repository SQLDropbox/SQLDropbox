import Link from "next/link";
import {
    FaUsers,
    FaFileAlt,
    FaBookOpen,
    FaEdit,
    FaTrash,
} from "react-icons/fa";

export default function AdminCourseCard() {
    const course = {
        id: 1,
        name: "Introduction to Databases",
        instructor: "Dr. Smith",
        students: 120,
        assignments: 5,
        active: true,
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {course.name}
                    </h3>

                    <p className="text-sm text-gray-500 mb-4">
                        {course.instructor}
                    </p>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaUsers className="text-sm" />
                            {course.students} students
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaFileAlt className="text-sm" />
                            {course.assignments} assignments
                        </div>
                    </div>
                </div>

                <span
                    className={`text-xs px-3 py-1 rounded-lg border border-gray-200 font-medium ${
                        course.active
                            ? "bg-gray-900 text-white"
                            : "bg-gray-200 text-gray-600"
                    }`}
                >
                    {course.active ? "Active" : "Inactive"}
                </span>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200">
                <Link href={`/admin/course/${course.id}`} className="flex-1">
                    <button className="w-full flex items-center justify-center gap-2 bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                        <FaBookOpen />
                        Manage
                    </button>
                </Link>

               <button className="border border-gray-400 rounded-lg px-3 py-2 transition-colors bg-white hover:bg-gray-200 text-gray-900 text-sm">
                    <FaEdit />
                </button>

                <button className="border rounded-lg px-3 py-2 transition-colors bg-red-500 hover:bg-red-600 text-white text-sm">
                    <FaTrash />
                </button>
            </div>
        </div>
    );
}
