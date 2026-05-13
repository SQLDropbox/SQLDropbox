"use client";

import AdminCourseCard from "@/components/admin/course/adminCourseCard";
import Header from "@/components/header";
import { courseService } from "@/services/courseService";
import { Course } from "@/types/types";
import { FaPlus } from "react-icons/fa6";
import { useQuery } from "@tanstack/react-query";
import EditCourseDialog from "@/components/admin/course/editCourseDialog";
import { useState } from "react";

export default function Page() {
    const [addDialogOpen, setAddDialogOpen] = useState(false);

    const { data, isLoading, error } = useQuery<Course[]>({
        queryKey: ["courses"],
        queryFn: courseService.getCourses,
    });

    return (
        <div>
            <Header />
            <div className="max-w-350 mx-auto p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1>Manage Courses</h1>
                    </div>
                    <button className="bg-gray-900 hover:bg-gray-700 transition-colors text-white py-1 px-2 rounded text-sm" onClick={() => setAddDialogOpen(true)}>
                        <FaPlus className="inline-block mr-1" />
                        New course
                    </button>
                </div>

                {isLoading && <p className="mt-6">Loading...</p>}

                {error && (
                    <p className="mt-6 text-red-500">
                        Something went wrong
                    </p>
                )}

                <div className="grid grid-cols-3 gap-6 my-6">
                    {data?.map((course: Course) => (
                        <AdminCourseCard key={course.courseId} course={course} />
                    ))}
                </div>
            </div>
            <EditCourseDialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
                mode="add"
            />
        </div>
    );
}
