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
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    const { data, isLoading, error, refetch } = useQuery<Course[]>({
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
                    <button
                        className="bg-gray-900 hover:bg-gray-700 transition-colors text-white py-1 px-2 rounded text-sm"
                        onClick={() => {
                            setSelectedCourse(null);
                            setEditDialogOpen(true);
                        }}
                    >
                        <FaPlus className="inline-block mr-1" />
                        New course
                    </button>
                </div>

                {isLoading && <p className="mt-6 text-gray-500">Loading...</p>}

                {error && (
                    <p className="mt-6 text-red-500">Something went wrong</p>
                )}

                {data?.length === 0 && !isLoading && (
                    <p className="mt-6 text-gray-500">No courses found.</p>
                )}

                <div className="grid grid-cols-3 gap-6 my-6">
                    {data?.map((course) => (
                        <AdminCourseCard
                            key={course.courseId}
                            course={course}
                            onEdit={() => {
                                setSelectedCourse(course);
                                setEditDialogOpen(true);
                            }}
                        />
                    ))}
                </div>
            </div>
            <EditCourseDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                onSuccess={refetch}
                mode={selectedCourse ? "edit" : "add"}
                course={selectedCourse ?? undefined}
            />
        </div>
    );
}
