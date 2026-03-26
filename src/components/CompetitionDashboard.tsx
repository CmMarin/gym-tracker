"use client";

import { motion } from "framer-motion";

export type FriendStats = {
  id: string;
  username: string;
  xp: number;
  rank: number;
  avatarColor: string;
};

export default function CompetitionDashboard({ leaderboard }: { leaderboard: FriendStats[] }) {
  const maxXP = Math.max(...leaderboard.map(f => f.xp), 1);

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border-2 border-gray-100 w-full max-w-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-extrabold text-slate-800">Weekly League</h2>
        <span className="text-sm font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">Live</span>
      </div>

      {leaderboard.length === 0 ? (
        <p className="text-center text-slate-500 font-bold py-4">Add friends to compete!</p>
      ) : (
        <div className="space-y-5">
          {leaderboard.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={"flex items-center p-4 rounded-2xl " + (user.username === "You" ? "bg-rose-100 border-2 border-rose-500" : "bg-gray-50 border-2 border-gray-100")}
            >
              <div className="font-black text-xl text-slate-400 w-8">{user.rank}</div>

              <div className={"w-12 h-12 rounded-full " + user.avatarColor + " border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-lg mr-4"}>
                {user.username.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-slate-800">{user.username}</h3>
                <div className="w-full h-3 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(user.xp / maxXP) * 100}%` }}
                    transition={{ type: "spring", stiffness: 40, damping: 10, delay: 0.3 }}
                    className={"h-full rounded-full " + (user.username === "You" ? "bg-rose-500" : "bg-indigo-500")}
                  />
                </div>
              </div>

              <div className="ml-4 font-black text-slate-700">{user.xp} <span className="text-xs text-slate-400">XP</span></div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
