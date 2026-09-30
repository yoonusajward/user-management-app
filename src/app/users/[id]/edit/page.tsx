"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

import ProtectedRoute from "@/components/ProtectedRoute";
import { auth, db } from "@/lib/firebase";

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [loadingUser, setLoadingUser] = useState(true);
  const [userLoaded, setUserLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const snapshot = await getDoc(doc(db, "users", id));

        if (!active) return;

        if (!snapshot.exists()) {
          setError("User not found.");
          return;
        }

        const user = snapshot.data();
        setName(user.name ?? "");
        setEmail(user.email ?? "");
        setStatus(user.status === "active" ? "active" : "inactive");
        setUserLoaded(true);
      } catch (err) {
        console.error(err);
        if (active) setError("Unable to load user.");
      } finally {
        if (active) setLoadingUser(false);
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, [id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (password && password.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    try {
      setSaving(true);
      const idToken = await currentUser.getIdToken();
      const response = await fetch(`/api/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ name, email, password, status }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to update user.");
        return;
      }

      router.push("/users");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-100">
        <div className="mx-auto max-w-2xl px-6 py-10">
          <Link href="/users" className="text-sm text-gray-600 hover:text-black">
            ← Back to Users
          </Link>

          <div className="mt-6 rounded-lg bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
            <p className="mt-1 text-sm text-gray-600">
              Update this user&apos;s details.
            </p>

            {error && (
              <div role="alert" className="mt-6 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {loadingUser ? (
              <p className="mt-6 text-sm text-gray-600">Loading user...</p>
            ) : !userLoaded ? null : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
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
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoComplete="email"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                    New Password (optional)
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-black"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave blank to keep the current password. New passwords need at least 8 characters.
                  </p>
                </div>

                <div>
                  <label htmlFor="status" className="mb-2 block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value as "active" | "inactive")}
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
                    disabled={saving}
                    className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
