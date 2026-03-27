"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Flame, Activity, Clock, Trophy, Dumbbell } from "lucide-react";
import ProfileAvatar from "@/components/ProfileAvatar";
import { formatDistanceToNow } from "date-fns";
import dynamic from "next/dynamic";

const FriendDetailsModal = dynamic(() => import("./FriendDetailsModal"), {
  ssr: false,
});

type Friend = {
  id: string;
  username: string;
  image: string | null;
  xp: number;
  streakDays: number;
  level: number;
  isOnline: boolean;
  activeWorkoutName?: string;
  lastActive: string | null;
  lastWorkoutName?: string;
};

export default function FriendsList({ initialFriends }: { initialFriends: Friend[] }) {
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);

  if (initialFriends.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border-2 border-gray-100 shadow-sm text-center">
        <User className="mx-auto text-slate-300 mb-4" size={48} />
        <h2 className="text-xl font-bold text-slate-800 mb-2">No Friends Yet</h2>
        <p className="text-slate-500 mb-4">Add some friends to see their activity!</p>
        {/* We can add a search bar here later */}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {initialFriends.map((friend) => (
          <motion.div
            key={friend.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedFriendId(friend.id)}
            className="bg-white rounded-3xl p-5 border-2 border-gray-100 shadow-sm flex items-center justify-between cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                 {friend.image ? (
                   <img src={friend.image} className="w-12 h-12 rounded-full border-2 border-gray-100 object-cover" />
                 ) : (
                   <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center font-bold text-lg">
                     {friend.username.charAt(0).toUpperCase()}
                   </div>
                 )}
                 {friend.isOnline && (
                   <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
                 )}
              </div>
              
              <div>
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  {friend.username}
                  <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg">
                    Lvl {friend.level}
                  </span>
                </h3>
                
                <div className="flex items-center gap-3 mt-1">
                  {friend.isOnline ? (
                    <span className="flex items-center text-xs font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-lg">
                      <Activity size={12} className="mr-1" />
                      {friend.activeWorkoutName || "Working out"}
                    </span>
                  ) : friend.lastActive ? (
                    <span className="flex items-center text-xs font-medium text-slate-500">
                      <Clock size={12} className="mr-1" />
                      Active {formatDistanceToNow(new Date(friend.lastActive), { addSuffix: true })}
                    </span>
                  ) : null}

                  {friend.streakDays > 0 && (
                     <span className="flex items-center text-xs font-bold text-orange-500">
                       <Flame size={12} className="mr-0.5" />
                       {friend.streakDays}
                     </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedFriendId && (
          <FriendDetailsModal 
             friendId={selectedFriendId} 
             onClose={() => setSelectedFriendId(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
