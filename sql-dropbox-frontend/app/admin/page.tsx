import AdminCourseCard from "@/components/admin/course/adminCourseCard";
import Header from "@/components/header";
import { Course } from "@/types/types";
import { Metadata } from "next";
import { FaPlus } from "react-icons/fa6";

export const metadata: Metadata = {
    title: "Admin Page",
};

export default function Page() {

    const courses: Course[] = [
        {
            courseID: 1,
            courseNameNL: "Inleiding tot Databases",
            courseNameEN: "Introduction to Databases",
            courseDescriptionNL: "Leer de basisprincipes van databases en SQL.",
            courseDescriptionEN: "Learn the fundamentals of databases and SQL.",
            lecturer: "Dr. Smith",
            deadline: new Date("2024-12-31"),
            isActive: true,
            studentCount: 120,
            chapterCount: 5,
        },
        {
            courseID: 2,
            courseNameNL: "Geavanceerde SQL",
            courseNameEN: "Advanced SQL",
            courseDescriptionNL: "Verdiep je in complexe SQL-query's en optimalisatie.",
            courseDescriptionEN: "Dive into complex SQL queries and optimization.",
            lecturer: "Prof. Johnson",
            deadline: new Date("2024-11-30"),
            isActive: false,
            studentCount: 80,
            chapterCount: 8,
        },
        {
            courseID: 3,
            courseNameNL: "Database Beheer",
            courseNameEN: "Database Administration",
            courseDescriptionNL: "Leer hoe je databases effectief beheert en onderhoudt.",
            courseDescriptionEN: "Learn how to effectively manage and maintain databases.",
            lecturer: "Dr. Lee",
            deadline: new Date("2024-10-15"),
            isActive: true,
            studentCount: 60,
            chapterCount: 6,
        },
    ];

    return (
        <div>
            <Header />
            <div className="max-w-350 mx-auto p-6">
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
                    {courses.map((course, index) => (
                        <AdminCourseCard key={index} course={course} />
                    ))}
                </div>
            </div>
        </div>
    );
}
