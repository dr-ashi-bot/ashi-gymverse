"use client";

import { useState } from "react";
import Link from "next/link";
import { resetAllProgress } from "@/lib/reset-progress";

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin";

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [resetDone, setResetDone] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setLoggedIn(true);
    } else {
      setError("Invalid username or password.");
    }
  };

  const handleResetProgress = () => {
    resetAllProgress();
    setResetDone(true);
  };

  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-duo-gray-bg flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-3xl border-2 border-duo-gray/10 bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-extrabold text-duo-gray mb-2">Admin</h1>
          <p className="text-sm text-duo-gray-light mb-6">
            Sign in to reset progress.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-user"
                className="mb-1 block text-sm font-bold text-duo-gray"
              >
                Username
              </label>
              <input
                id="admin-user"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-2xl border-2 border-duo-gray/20 bg-white px-4 py-3 text-duo-gray focus:border-duo-green focus:outline-none"
                autoComplete="username"
              />
            </div>
            <div>
              <label
                htmlFor="admin-pass"
                className="mb-1 block text-sm font-bold text-duo-gray"
              >
                Password
              </label>
              <input
                id="admin-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border-2 border-duo-gray/20 bg-white px-4 py-3 text-duo-gray focus:border-duo-green focus:outline-none"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="text-sm text-duo-red" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-2xl bg-duo-green px-4 py-3 font-bold text-white hover:bg-duo-green-hover focus:outline-none focus:ring-4 focus:ring-duo-green/30"
            >
              Sign in
            </button>
          </form>
        </div>
        <Link
          href="/"
          className="mt-6 text-sm font-bold text-duo-blue underline hover:no-underline"
        >
          Back to Practice
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-duo-gray-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl border-2 border-duo-gray/10 bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-extrabold text-duo-gray mb-2">Admin</h1>
        <p className="text-sm text-duo-gray-light mb-6">
          Reset all progress for this device (XP, hearts, streak, sessions, notes).
        </p>
        {resetDone ? (
          <p className="text-duo-green font-bold mb-4">
            Progress reset. You can go back to Practice.
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResetProgress}
            className="w-full rounded-2xl bg-duo-red px-4 py-3 font-bold text-white hover:bg-duo-red-hover focus:outline-none focus:ring-4 focus:ring-duo-red/30"
          >
            Reset progress
          </button>
        )}
        <Link
          href="/"
          className="mt-6 block text-center text-sm font-bold text-duo-blue underline hover:no-underline"
        >
          Back to Practice
        </Link>
      </div>
    </main>
  );
}
