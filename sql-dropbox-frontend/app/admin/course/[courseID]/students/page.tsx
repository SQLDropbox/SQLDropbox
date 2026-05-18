"use client";

import { useParams } from "next/navigation";
import Header from "@/components/header";
import { Course } from "@/types/types";
import AdminCourseDetailsHeader from "@/components/admin/course/adminCourseDetailsHeader";

export default function Page() {
    const params = useParams();

    const course: Course = {
        courseId: params.courseID ? parseInt(params.courseID[0]) : 0,
        courseNameNL: "Inleiding tot Databases",
        courseNameEN: "Introduction to Databases",
        courseDescriptionNL: "Leer de basisprincipes van databases en SQL.",
        courseDescriptionEN: "Learn the fundamentals of databases and SQL.",
        lecturer: "Dr. Smith",
        deadline: new Date("2024-12-31"),
        isActive: true,
    };

    return (
        <div>
            <Header />
            <div className="max-w-350 mx-auto p-6">
                <AdminCourseDetailsHeader course={course} />
            </div>
        </div>
    );
}
