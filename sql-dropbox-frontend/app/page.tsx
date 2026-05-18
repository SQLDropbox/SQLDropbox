"use client";

import Header from "@/components/header";
import { courseService } from "@/services/courseService";
import { Course } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import CourseCard from "@/components/courseCard";

export default function Page() {
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
                        <h1>Courses</h1>
                    </div>
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
                        <CourseCard
                            key={course.courseId}
                            course={course}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
