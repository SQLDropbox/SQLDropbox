"use client";

import AdminCourseCard from "@/components/admin/course/adminCourseCard";
import Header from "@/components/header";
import { courseService } from "@/services/courseService";
import { Course } from "@/types/types";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";

export default function Page() {

const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadCourses() {
            try {
                const data = await courseService.getCourses();
                setCourses(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Something went wrong.");
                }
            } finally {
                setLoading(false);
            }
        }

        loadCourses();
    }, []);

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
