"use client";

import { useParams } from "next/navigation";
import Header from "@/components/header";
import { Course } from "@/types/types";
import AdminCourseDetailsHeader from "@/components/admin/course/adminCourseDetailsHeader";
import { useQuery } from "@tanstack/react-query";
import { courseService } from "@/services/courseService";

export default function Page() {
    const params = useParams();

    const courseId = (params.courseId as string) ?? undefined;

    const {
        data: course,
        isLoading,
        error,
    } = useQuery<Course>({
        queryKey: ["course", courseId],
        queryFn: () => courseService.getCourseByCourseId(courseId),
        enabled: !!courseId,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />

                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                    <p className="text-sm text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header />
            <div className="max-w-350 mx-auto p-6">
                <AdminCourseDetailsHeader course={course!} />

                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-3">Students</h2>
                    <div className="bg-white rounded-lg border border-gray-200 shadow-lg">
                        {course?.students && course.students.length > 0 ? (
                            <ul className="divide-y m-2 divide-gray-200">
                                {course.students.map((student) => (
                                    <li
                                        key={student.studentCode}
                                        className="px-4 py-3 text-sm"
                                    >
                                        {student.firstName} {student.lastName}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 m-2">
                                No students enrolled.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
