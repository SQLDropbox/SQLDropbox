"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Header from "@/components/header";
import { Course } from "@/types/types";
import AdminCourseDetailsHeader from "@/components/admin/course/adminCourseDetailsHeader";
import { useQuery } from "@tanstack/react-query";
import { courseService } from "@/services/courseService";
import { FaSearch, FaUserPlus, FaUpload } from "react-icons/fa";
import AddStudentModal from "@/components/student/addStudentModal";
import ImportStudentsModal from "@/components/student/importStudentsModal";

interface StudentImport {
    userCode: string;
    firstName: string;
    lastName: string;
}

export default function Page() {
    const params = useParams();
    const [search, setSearch] = useState("");
    const [modalTab, setModalTab] = useState<"upload" | "manual" | null>(null);

    const courseId = (params.courseId as string) ?? undefined;

    const {
        data: course,
        isLoading,
        refetch,
    } = useQuery<Course>({
        queryKey: ["course", courseId],
        queryFn: () => courseService.getCourseByCourseId(courseId),
        enabled: !!courseId,
        retry: false,
    });

    const filteredStudents = course?.students?.filter(
        (student) =>
            `${student.firstName} ${student.lastName}`
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            student.userCode.toLowerCase().includes(search.toLowerCase()),
    );

    function handleImport(students: StudentImport[]) {
        // TODO: call your API / mutation here, e.g.:
        // await courseService.addStudents(courseId, students);
        console.log("Importing students:", students);
    }

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

                <div className="mt-8 flex flex-col gap-6">
                    <div className="flex justify-between">
                        <div className="relative w-full max-w-80">
                            <input
                                type="text"
                                placeholder="search ..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                                onClick={() => setModalTab("manual")}
                            >
                                <FaUserPlus />
                                Manual input
                            </button>
                            <button
                                className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
                                onClick={() => setModalTab("upload")}
                            >
                                <FaUpload />
                                Upload file
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 shadow-lg">
                        {filteredStudents && filteredStudents.length > 0 ? (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 text-left text-gray-500 font-medium">
                                        <th className="px-4 py-3">
                                            Student Code
                                        </th>
                                        <th className="px-4 py-3">Name</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredStudents.map((student) => (
                                        <tr
                                            key={student.userCode}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-3">
                                                {student.userCode}
                                            </td>
                                            <td className="px-4 py-3">
                                                {student.firstName}{" "}
                                                {student.lastName}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-sm text-gray-500 m-2 p-2">
                                No students found.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {modalTab === "manual" && (
                <AddStudentModal
                    courseId={courseId!}
                    onClose={() => setModalTab(null)}
                    onSuccess={() => {
                        setModalTab(null);
                        refetch();
                    }}
                />
            )}

            {modalTab === "upload" && (
                <ImportStudentsModal
                    courseId={courseId!}
                    onClose={() => setModalTab(null)}
                    onSuccess={() => {
                        setModalTab(null);
                        refetch();
                    }}
                />
            )}
        </div>
    );
}
