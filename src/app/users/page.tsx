"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { collection, getDocs, Timestamp } from "firebase/firestore";

import ProtectedRoute from "@/components/ProtectedRoute";
import { auth, db } from "@/lib/firebase";
import { AppUser } from "@/types/user";

const USERS_PER_PAGE = 10;

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        setError("");

        const snapshot = await getDocs(collection(db, "users"));

        const loadedUsers: AppUser[] = snapshot.docs.map((document) => {
          const data = document.data();

          return {
            id: document.id,
            name: data.name ?? "",
            email: data.email ?? "",
            status: data.status ?? "inactive",
            createdAt:
              data.createdAt instanceof Timestamp ? data.createdAt : null,
          };
        });

        loadedUsers.sort((a, b) => {
          const aTime = a.createdAt?.toMillis() ?? 0;
          const bTime = b.createdAt?.toMillis() ?? 0;

          return bTime - aTime;
        });

        setUsers(loadedUsers);
      } catch (err) {
        console.error(err);
        setError("Unable to load users.");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();

    if (!term) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    });
  }, [users, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / USERS_PER_PAGE),
  );

  const startIndex = (currentPage - 1) * USERS_PER_PAGE;

  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + USERS_PER_PAGE,
  );

  const showingFrom = filteredUsers.length === 0 ? 0 : startIndex + 1;

  const showingTo = Math.min(startIndex + USERS_PER_PAGE, filteredUsers.length);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSearchTerm(searchInput.trim());
    setCurrentPage(1);
  }

  function handleClearSearch() {
    setSearchInput("");
    setSearchTerm("");
    setCurrentPage(1);
  }

  async function handleDelete(user: AppUser) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) return;

    const currentUser = auth.currentUser;

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    try {
      setError("");
      const idToken = await currentUser.getIdToken();
      const response = await fetch(
        `/api/users/${encodeURIComponent(user.id)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to delete user.");
        return;
      }

      setUsers((currentUsers) =>
        currentUsers.filter((listedUser) => listedUser.id !== user.id)
      );
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while deleting the user.");
    }
  }

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  function formatDate(timestamp: Timestamp | null) {
    if (!timestamp) {
      return "-";
    }

    return timestamp.toDate().toLocaleDateString("en-GB");
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-100">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                User Management
              </h1>

              <p className="text-sm text-gray-500">
                Junior Developer Assessment
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/fibonacci"
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Fibonacci
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Users</h2>

              <p className="mt-1 text-sm text-gray-600">
                View and manage system users.
              </p>
            </div>

            <Link
              href="/users/add"
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Add User
            </Link>
          </div>

          <div className="rounded-lg bg-white shadow-sm">
            <div className="border-b p-5">
              <form onSubmit={handleSearch} className="flex max-w-xl gap-2">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-black"
                />

                <button
                  type="submit"
                  className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
                >
                  Search
                </button>

                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700"
                  >
                    Clear
                  </button>
                )}
              </form>
            </div>

            {error && (
              <div className="m-5 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading users...
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-5 py-3 font-medium">No</th>

                        <th className="px-5 py-3 font-medium">Name</th>

                        <th className="px-5 py-3 font-medium">Email</th>

                        <th className="px-5 py-3 font-medium">Status</th>

                        <th className="px-5 py-3 font-medium">Created At</th>

                        <th className="px-5 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedUsers.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-5 py-10 text-center text-gray-500"
                          >
                            No users found.
                          </td>
                        </tr>
                      ) : (
                        paginatedUsers.map((user, index) => (
                          <tr
                            key={user.id}
                            className="border-b last:border-b-0"
                          >
                            <td className="px-5 py-4 text-gray-600">
                              {startIndex + index + 1}
                            </td>

                            <td className="px-5 py-4 font-medium text-gray-900">
                              {user.name}
                            </td>

                            <td className="px-5 py-4 text-gray-600">
                              {user.email}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                  user.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {user.status === "active"
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-gray-600">
                              {formatDate(user.createdAt)}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <Link
                                  href={`/users/${user.id}/edit`}
                                  className="font-medium text-blue-600 hover:underline"
                                >
                                  Edit
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(user)}
                                  className="font-medium text-red-600 hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-4 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {showingFrom}–{showingTo} of {filteredUsers.length}{" "}
                    records
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((page) => Math.max(page - 1, 1))
                      }
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>

                    <span className="px-2 text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={
                        currentPage === totalPages || filteredUsers.length === 0
                      }
                      onClick={() =>
                        setCurrentPage((page) => Math.min(page + 1, totalPages))
                      }
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
