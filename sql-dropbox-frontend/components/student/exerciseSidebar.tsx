"use client";

import { FaRegCircle } from "react-icons/fa6";

import { Exercise } from "@/types/types";

function LoadingSkeleton() {
	return (
		<div className="w-full rounded-2xl border bg-white px-4 py-4 animate-pulse">
			<div className="flex items-start gap-3">
				<div className="h-8 w-8 shrink-0 rounded-full bg-slate-100" />
				<div className="flex-1">
					<div className="h-3 w-32 rounded bg-slate-100" />
					<div className="mt-2 h-3 w-48 rounded bg-slate-100" />
				</div>
			</div>
		</div>
	);
}

interface ExerciseSidebarProps {
	exercises: Exercise[];
	activeExerciseId: number | null;
	completedExerciseIds: number[];
	onSelectExercise: (exerciseId: number) => void;
	isLoading?: boolean;
}

export default function ExerciseSidebar({
	exercises,
	activeExerciseId,
	completedExerciseIds,
	onSelectExercise,
	isLoading = false,
}: ExerciseSidebarProps) {
	return (
		<aside className="flex min-h-0 flex-col border-b border-gray-200 bg-slate-50/80 lg:border-b-0 lg:border-r">
			<div className="border-b border-gray-200 px-5 py-4">
				<h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
					Questions
				</h2>
			</div>

			<div className="flex-1 min-h-0 space-y-3 overflow-y-auto p-4 sm:p-5">
				{isLoading
					? Array.from({ length: 6 }).map((_, index) => <LoadingSkeleton key={index} />)
					: exercises.map((exercise, index) => {
						const isActive = exercise.exerciseId === activeExerciseId;
						const isCompleted = completedExerciseIds.includes(exercise.exerciseId);

					return (
						<button
							key={exercise.exerciseId}
							type="button"
							onClick={() => onSelectExercise(exercise.exerciseId)}
							className={`w-full rounded-2xl border px-4 py-4 text-left transition-all ${
								isActive
									? "border-slate-950 bg-white shadow-sm"
									: "border-gray-200 bg-white hover:border-slate-300 hover:shadow-sm"
							}`}
						>
							<div className="flex items-start gap-3">
								<div
									className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
										isCompleted
											? "bg-emerald-100 text-emerald-700"
											: isActive
												? "bg-slate-950 text-white"
												: "bg-slate-100 text-slate-600"
									}`}
								>
									{isCompleted ? "✓" : index + 1}
								</div>
								<div className="min-w-0 flex-1">
									<div className="flex items-center justify-between gap-3">
										<span className="text-xs font-medium uppercase tracking-wide text-slate-500">
											Question {index + 1}
										</span>
										{isCompleted ? (
											<span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
												Completed
											</span>
										) : (
											<FaRegCircle className="mt-0.5 text-slate-300" />
										)}
									</div>
									<p className="mt-1 line-clamp-2 text-sm font-medium text-slate-900">
										{exercise.questionNL || "Untitled exercise"}
									</p>
								</div>
							</div>
						</button>
					);
						})}
			</div>
		</aside>
	);
}
