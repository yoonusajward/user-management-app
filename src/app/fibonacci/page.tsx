"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function FibonacciPage() {
  const [rows, setRows] = useState("");
  const [columns, setColumns] = useState("");
  const [table, setTable] = useState<string[][]>([]);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setTable([]);

    const rowCount = Number(rows);
    const columnCount = Number(columns);

    if (
      !Number.isInteger(rowCount) ||
      !Number.isInteger(columnCount) ||
      rowCount <= 0 ||
      columnCount <= 0
    ) {
      setError("Rows and Columns must be positive whole numbers.");
      return;
    }

    if (rowCount > 20 || columnCount > 20) {
      setError("Rows and Columns cannot be greater than 20.");
      return;
    }

    const result: string[][] = [];

    let first = BigInt(0);
    let second = BigInt(1);

    for (let row = 0; row < rowCount; row++) {
      const currentRow: string[] = [];

      for (let column = 0; column < columnCount; column++) {
        currentRow.push(first.toString());

        const next = first + second;
        first = second;
        second = next;
      }

      result.push(currentRow);
    }

    setTable(result);
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

            <Link
              href="/users"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Users
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Fibonacci Generator
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Generate a Fibonacci sequence using the requested number of rows
              and columns.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="rows"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Rows
                </label>

                <input
                  id="rows"
                  type="number"
                  min="1"
                  max="20"
                  value={rows}
                  onChange={(event) => setRows(event.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-black"
                />
              </div>

              <div>
                <label
                  htmlFor="columns"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Columns
                </label>

                <input
                  id="columns"
                  type="number"
                  min="1"
                  max="20"
                  value={columns}
                  onChange={(event) => setColumns(event.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Generate
                </button>
              </div>
            </form>
          </div>

          {table.length > 0 && (
            <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900">Result</h3>

                <p className="mt-1 text-sm text-gray-600">
                  {rows} rows × {columns} columns ={" "}
                  {Number(rows) * Number(columns)} numbers
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="border-collapse">
                  <tbody>
                    {table.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((number, columnIndex) => (
                          <td
                            key={columnIndex}
                            className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-900"
                          >
                            {number}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
