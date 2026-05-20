"use client";

import Header from "@/components/header";
import { authService } from "@/services/authService";
import { useQuery } from "@tanstack/react-query";
import { notFound, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FaEnvelope, FaEye, FaEyeSlash, FaLock } from "react-icons/fa6";

export default function Page() {
  const router = useRouter();

  const params = useParams();
  const studentId = (params.studentId as string) ?? undefined;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["student", studentId],
    queryFn: () => authService.getAccountSetup(studentId!),
    enabled: !!studentId,
    retry: false,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMessage("");

    if (!password || !confirmPassword) {
      setErrorMessage("Password fields cannot be empty.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    try {
      const response = await authService.setupAccount(studentId, password);
      const loggedInUser = {
        name: response.name,
        role: response.role,
        token: response.token,
      };
      localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
      router.push("/");
    } catch (err: any) {
      setErrorMessage(err.message ?? "Something went wrong.");
    }
  };

  if (error) {
    notFound();
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
    <div className="min-h-screen">
      <Header />

      <div className="max-w-350 mx-auto p-6 flex justify-center items-center min-h-[80vh]">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white px-8 py-8 shadow-sm hover:shadow-lg transition-shadow">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome {data.firstName}!
            </h1>
            <p className="text-gray-600">
              Please set a password to activate your account
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* UserId (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID
              </label>

              <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                <FaEnvelope className="text-gray-500 text-sm" />

                <input
                  type="text"
                  value={data.userId}
                  readOnly
                  className="w-full outline-none text-sm text-gray-700 bg-transparent"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-3 bg-white focus-within:border-black transition-colors">
                <FaLock className="text-gray-500 text-sm" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a secure password"
                  className="w-full outline-none text-sm text-gray-900 placeholder:text-gray-400 bg-transparent"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 text-sm hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>

              <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-3 bg-white focus-within:border-black transition-colors">
                <FaLock className="text-gray-500 text-sm" />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full outline-none text-sm text-gray-900 placeholder:text-gray-400 bg-transparent"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-500 text-sm hover:text-gray-700"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="text-center">
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={password.length == 0 || password !== confirmPassword}
              className="w-full flex items-center justify-center gap-2 text-sm px-4 py-3 rounded-lg transition-colors cursor-pointer
        bg-black text-white hover:bg-gray-800
        disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
            >
              Create account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
