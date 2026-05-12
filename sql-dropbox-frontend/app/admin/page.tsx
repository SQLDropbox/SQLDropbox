import AdminCourseCard from "@/components/admin/adminCourseCard";
import Header from "@/components/header";
import { Metadata } from "next";
import { FaPlus } from "react-icons/fa6";

export const metadata: Metadata = {
    title: "Admin Page",
};

export default function Home() {
    return (
        <div>
            <Header />
            <div className="max-w-300 mx-auto m-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1>Manage Courses</h1>
                    </div>
                    <button className="bg-gray-900 hover:bg-gray-700 transition-colors text-white py-1 px-2 rounded text-sm">
                        <FaPlus className="inline-block mr-1" />
                        New course
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-6 my-6">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <AdminCourseCard key={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}
