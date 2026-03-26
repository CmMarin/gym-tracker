"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoveRight } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (res?.error) {
      setError("Invalid username or password");
      setIsLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-sm border-2 border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-800 mb-2">Welcome Back!</h1>
          <p className="text-slate-500 font-medium">Ready to crush your goals?</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 font-bold p-4 rounded-xl mb-6 border-2 border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full text-lg font-bold text-slate-700 bg-gray-100 rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all border-2 border-transparent focus:bg-white"
              placeholder="e.g. jsmith"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-lg font-bold text-slate-700 bg-gray-100 rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all border-2 border-transparent focus:bg-white"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-400 disabled:bg-blue-300 text-white font-black text-xl py-5 rounded-2xl shadow-[0_6px_0_0_#2563eb] active:shadow-[0_0px_0_0_#2563eb] active:translate-y-[6px] transition-all flex justify-center items-center space-x-2 mt-4"
          >
            <span>{isLoading ? "LOADING..." : "LOGIN"}</span>
            {!isLoading && <MoveRight strokeWidth={3} />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-bold">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-500 hover:text-blue-600">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}