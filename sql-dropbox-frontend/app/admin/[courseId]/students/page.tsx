"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Header from "@/components/header";
import { Course } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import AddStudentModal from "@/components/admin/student/addStudentModal";
import ImportStudentsModal from "@/components/admin/student/importStudentsModal";
import AdminCourseNav from "@/components/admin/course/adminCourseNav";
import { userService } from "@/services/userService";
import StudentTable from "@/components/admin/student/studentTable";
import Loading from "@/components/loading";
import { useTranslations } from "next-intl";
import Link from "next/link";
import ConfirmDialog from "@/components/dialog/confirmDialog";
import { courseService } from "@/services/courseService";

export default function Page() {
    const params = useParams();
    const [modalTab, setModalTab] = useState<"upload" | "manual" | null>(null);
    const [confirmInviteOpen, setConfirmInviteOpen] = useState(false);
    const t = useTranslations("Course");

    const courseId = (params.courseId as string) ?? undefined;

    const {
        data: course,
        isLoading,
        refetch,
    } = useQuery<Course>({
        queryKey: ["course", courseId],
        queryFn: () => userService.getStudents(courseId),
        enabled: !!courseId,
        retry: false,
    });

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <div className="flex flex-1 relative">
                <div className="sticky top-0 h-screen">
                    <AdminCourseNav course={course!} />
                </div>

                <main className="flex-1 flex flex-col gap-6 p-8 md:p-12 max-w-7xl mx-auto">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted hover:text-ink"
                    >
                        ← {t("backToCourses")}
                    </Link>

                    <StudentTable
                        course={course!}
                        onAddManual={() => setModalTab("manual")}
                        onUpload={() => setModalTab("upload")}
                        onInviteStudents={() => setConfirmInviteOpen(true)}
                    />
                </main>
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

            <ConfirmDialog
                open={confirmInviteOpen}
                onClose={() => setConfirmInviteOpen(false)}
                onConfirm={() => {
                    courseService.inviteStudents(courseId!).then(() => {
                        setConfirmInviteOpen(false);
                    });
                }}
                title={"Invite students"}
                description={`Are you sure you want to invite all students to this course? This will send an email invitation to ${course?.invitePossibleCount || 0} student(s).`}
                type={"confirm"}
            />
        </div>
    );
}
