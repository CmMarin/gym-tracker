'use client'

import { useState } from 'react';
import { getExerciseHistory } from '@/app/actions/exercise-history-actions';
import { format } from 'date-fns';
import { History, X } from 'lucide-react';

export default function ExerciseHistoryWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<Awaited<ReturnType<typeof getExerciseHistory>>>([]);
  const [loading, setLoading] = useState(false);

  const openModal = async () => {
    setIsOpen(true);
    if (history.length === 0) {
      setLoading(true);
      try {
        const data = await getExerciseHistory();
        setHistory(data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={openModal}
        className="w-full bg-[var(--color-white)] rounded-3xl p-6 shadow-[0_4px_0_var(--color-theme-shadow)] border-2 border-indigo-50 flex items-center justify-between transition-transform active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
            <History size={24} />
          </div>
          <h2 className="text-xl font-black text-slate-800">All-Time Exercise Log</h2>
        </div>
        <div className="text-indigo-500 font-bold">View System &rarr;</div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-background)] rounded-[2.5rem] w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="p-6 border-b border-indigo-50/20 flex justify-between items-center bg-[var(--color-white)] z-10">
              <h2 className="text-2xl font-black text-slate-800">Exercise History</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 bg-gray-100 text-gray-500 hover:text-gray-800 rounded-full transition-colors"
              >
                <X size={20} className="stroke-[3]" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto overflow-x-hidden flex-1 bg-gray-50 min-h-[300px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="text-slate-500 font-bold">Loading classified data...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-bold bg-[var(--color-white)] rounded-2xl shadow-sm border border-indigo-50">
                  No records found logs yet! Start lifting!
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {history.map((item, index) => (
                    <div key={index} className="bg-[var(--color-white)] p-4 rounded-2xl shadow-[0_2px_0_var(--color-theme-shadow)] border-2 border-indigo-50/30">
                      <div className="font-bold text-slate-800 mb-3 text-lg leading-tight break-words">{item.name}</div>
                      
                      <div className="flex flex-wrap gap-2 text-sm">
                        <div className="flex-1 bg-yellow-50 text-yellow-800 px-3 py-2 rounded-xl flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-wider text-yellow-600/70 mb-0.5">All-Time PR</span>
                          <span className="font-black text-base">{item.pr} kg</span>
                        </div>
                        <div className="flex-1 bg-indigo-50 text-indigo-800 px-3 py-2 rounded-xl flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600/70 mb-0.5">Last Record</span>
                          <span className="font-black text-base">{item.lastWeight} kg <span className="text-indigo-400 font-semibold text-xs ml-1">&times; {item.lastReps} reps</span></span>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-right">
                        <span className="text-xs font-bold text-slate-400">
                          Last seen: {format(new Date(item.lastDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
