"use client";

import Header from "@/components/header";
import { authService } from "@/services/authService";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function Page() {
    const params = useParams();
    const studentId = (params.studentId as string) ?? undefined;

    const { data, isLoading, error } = useQuery({
        queryKey: ["student", studentId],
        queryFn: () => authService.setupPassword(studentId!),
        enabled: !!studentId,
    });

    console.log("data:", data);

    return (
        <div className="min-h-screen">
            <Header />

            <div className="max-w-350 mx-auto p-6 flex justify-center items-center min-h-[80vh]">
                <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white px-8 py-8 shadow-sm hover:shadow-lg transition-shadow">
                    test {studentId}
                </div>
            </div>
        </div>
    );
}
