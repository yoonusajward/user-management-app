"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

import ProtectedRoute from "@/components/ProtectedRoute";
import { auth } from "@/lib/firebase";

export default function UsersPage() {
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between rounded-lg bg-white p-6 shadow-sm">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Users</h1>

              <p className="mt-1 text-sm text-gray-600">
                Manage application users
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
            >
              Logout
            </button>
          </div>

          <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
            <p className="text-gray-600">User list will be added next.</p>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
