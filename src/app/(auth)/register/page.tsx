"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Automatically redirect to login after successful registration
      router.push("/login");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-sm border-2 border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-800 mb-2">Create Profile</h1>
          <p className="text-slate-500 font-medium">Join the leaderboard today.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 font-bold p-4 rounded-xl mb-6 border-2 border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Choose Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full text-lg font-bold text-slate-700 bg-gray-100 rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-green-400 transition-all border-2 border-transparent focus:bg-white"
              placeholder="e.g. jsmith"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Create Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-lg font-bold text-slate-700 bg-gray-100 rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-green-400 transition-all border-2 border-transparent focus:bg-white"
              placeholder="Min 6 characters"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-300 text-white font-black text-xl py-5 rounded-2xl shadow-[0_6px_0_0_#16a34a] active:shadow-[0_0px_0_0_#16a34a] active:translate-y-[6px] transition-all flex justify-center items-center space-x-2 mt-4"
          >
            <UserPlus strokeWidth={3} className="mr-2" />
            <span>{isLoading ? "CREATING..." : "SIGN UP"}</span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-bold">
            Already play?{" "}
            <Link href="/login" className="text-green-500 hover:text-green-600">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}