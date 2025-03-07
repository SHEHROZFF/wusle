"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();

  async function handleReset() {
    setStatus("Working...");
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("Password reset successful. You can sign in now!");
        // Optionally redirect:
        // router.push("/login");
      } else {
        setStatus(data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Server error");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        {!token ? (
          <p className="text-red-500">No reset token provided</p>
        ) : (
          <>
            <input
              className="w-full border p-2 mb-3"
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              className="w-full bg-blue-600 text-white py-2 rounded"
              onClick={handleReset}
            >
              Update Password
            </button>
            {status && <p className="mt-2 text-sm text-gray-700">{status}</p>}
          </>
        )}
      </div>
    </div>
  );
}
