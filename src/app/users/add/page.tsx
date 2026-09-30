"use client";

import { FormEvent, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/ProtectedRoute";
import { auth } from "@/lib/firebase";

export default function AddUserPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);

      const idToken = await currentUser.getIdToken();

      const response = await fetch("/api/users", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },

        body: JSON.stringify({
          name,
          email,
          password,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to create user.");

        return;
      }

      router.push("/users");
    } catch (error) {
      console.error(error);

      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-100">
        <div className="mx-auto max-w-2xl px-6 py-10">
          <div className="mb-6">
            <Link
              href="/users"
              className="text-sm text-gray-600 hover:text-black"
            >
              ← Back to Users
            </Link>
          </div>

          <div className="rounded-lg bg-white p-8 shadow-sm">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add User</h1>

              <p className="mt-1 text-sm text-gray-600">
                Create a new system user.
              </p>
            </div>

            {error && (
              <div className="mt-6 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-black"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-black"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-black"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Minimum 8 characters.
                </p>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Status
                </label>

                <select
                  id="status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as "active" | "inactive")
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-black"
                >
                  <option value="active">Active</option>

                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 border-t pt-6">
                <Link
                  href="/users"
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
