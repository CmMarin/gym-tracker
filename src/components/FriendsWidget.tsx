"use client";

import { useState } from "react";
import { searchUser, sendFriendRequest, acceptFriendRequest } from "@/app/(app)/dashboard/actions";
import { Search, UserPlus, Check, UserCheck } from "lucide-react";

type PendingRequest = {
  friendshipId: string;
  user: {
    username: string;
  };
};

type SearchResult = {
  id: string;
  username: string;
  sent?: boolean;
};

export default function FriendsWidget({ pendingRequests }: { pendingRequests: PendingRequest[] }) {
  const [search, setSearch] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    const res = await searchUser(search.trim());
    if ('error' in res && res.error) {
      setError(res.error);
    } else if ('user' in res && res.user) {
      setResult(res.user);
    }
    setLoading(false);
  };

  const handleSendRequest = async () => {
    if (!result) return;
    await sendFriendRequest(result.id);
    setResult({ ...result, sent: true });
  };

  const handleAccept = async (id: string) => {
    await acceptFriendRequest(id);
  };

  return (
    <div className="w-full max-w-md bg-[var(--color-white)] rounded-[2rem] p-6 shadow-sm border-2 border-indigo-50 flex flex-col space-y-6">
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-xl font-extrabold text-slate-800 mb-3">Pending Invites</h3>
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div key={req.friendshipId} className="flex items-center justify-between bg-amber-50 p-3 rounded-2xl border-2 border-amber-100">
                <div className="font-bold text-slate-800">@{req.user.username}</div>
                <button
                  onClick={() => handleAccept(req.friendshipId)}
                  className="bg-green-500 hover:bg-green-400 text-[var(--color-white)] rounded-xl p-2 shadow-[0_4px_0_0_#16a34a] active:shadow-none active:translate-y-[4px] transition-all"
                >
                  <Check size={20} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
          <hr className="mt-6 border-indigo-50" />
        </div>
      )}

      <div>
        <h3 className="text-xl font-extrabold text-slate-800 mb-4">Add Friends</h3>
        <form onSubmit={handleSearch} className="flex space-x-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username..."
            className="flex-1 bg-gray-100 text-slate-700 font-bold p-3 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:bg-[var(--color-white)] transition-all"
          />
          <button
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-400 text-[var(--color-white)] font-bold p-3 rounded-2xl shadow-[0_4px_0_0_var(--color-indigo-600)] active:shadow-none active:translate-y-[4px] transition-all"
          >
            <Search size={22} strokeWidth={3} />
          </button>
        </form>

        {loading && <p className="text-slate-500 font-bold mt-4 text-center">Searching...</p>}
        {error && <p className="text-red-500 font-bold mt-4 text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
        
        {result && (
          <div className="mt-4 flex items-center justify-between bg-gray-50 border-2 border-indigo-50 p-4 rounded-2xl">
            <div className="font-bold text-slate-800 text-lg">@{result.username}</div>
            {result.sent ? (
              <span className="text-green-500 font-bold flex items-center"><UserCheck size={20} className="mr-1" /> Sent!</span>
            ) : (
              <button
                onClick={handleSendRequest}
                className="bg-slate-800 hover:bg-slate-700 text-[var(--color-white)] font-bold px-4 py-2 rounded-xl shadow-[0_4px_0_0_var(--color-button-shadow)] active:shadow-[0_0px_0_0_var(--color-button-shadow)] active:translate-y-[4px] transition-all flex items-center space-x-2"
              >
                <UserPlus size={18} />
                <span>ADD</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
