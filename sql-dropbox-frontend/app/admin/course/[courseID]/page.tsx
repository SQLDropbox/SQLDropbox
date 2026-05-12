"use client";

import { useParams } from "next/navigation";
import Header from "@/components/header";

export default function Page() {
    const params = useParams();

    return (
        <div>
            <Header />

            <p>COURSE {params.courseID}</p>
        </div>
    );
}
