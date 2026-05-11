"use client";

import { motion } from "framer-motion";

const BARBELL_WEIGHT = 20;
const AVAILABLE_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

export const VisualBarbell = ({ weight }: { weight: number }) => {
  const getPlatesArray = (w: number) => {
    let remaining = (w - BARBELL_WEIGHT) / 2;
    if (remaining <= 0) return [];

    const plates: number[] = [];
    AVAILABLE_PLATES.forEach((plate) => {
      while (remaining >= plate) {
        plates.push(plate);
        remaining -= plate;
        remaining = Math.round(remaining * 100) / 100; // Fix JS float math     
      }
    });
    return plates;
  };

  const plates = getPlatesArray(weight);

  const getPlateStyle = (w: number) => {
    switch (w) {
      case 25: return "bg-rose-500 h-28 w-6 border-l-2 border-rose-400";        
      case 20: return "bg-blue-500 h-28 w-6 border-l-2 border-blue-400";        
      case 15: return "bg-yellow-400 h-24 w-6 border-l-2 border-yellow-300";    
      case 10: return "bg-emerald-500 h-16 w-5 border-l-2 border-emerald-400";  
      case 5: return "bg-[var(--color-white)] h-12 w-4 border-l-2 border-gray-200";
      case 2.5: return "bg-[var(--color-slate-800)] h-10 w-3 border-l border-slate-600";
      case 1.25: return "bg-[var(--color-slate-400)] h-8 w-2.5 border-l border-slate-300";
      default: return "bg-gray-500 h-12 w-4";
    }
  };

  if (plates.length === 0) {
    return <div className="text-center text-sm font-bold text-[var(--color-indigo-200)] my-6">Empty Bar (20kg)</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full mt-4 overflow-[visible] rounded-xl pt-4 pb-6 relative">
       <div className="relative flex items-center justify-center w-full h-32 ml-4">
         {/* Left Collars & Plates */}
         <div className="flex items-center justify-end gap-[1px] -mr-[2px] z-30 h-full scale-x-[-1]">
           {plates.map((plate, idx) => (
             <motion.div
               key={`L-${plate}-${idx}`}
               initial={{ x: 100, opacity: 0, rotateY: 45 }}
               animate={{ x: 0, opacity: 1, rotateY: 0 }}
               transition={{ delay: idx * 0.05, type: "spring", stiffness: 400, damping: 25 }}
               className={`rounded-[2px] flex items-center justify-center relative shadow-sm ${getPlateStyle(plate)}`}
             >
               <span className={`text-[10px] font-black tracking-tighter -rotate-90 absolute ${plate === 5 || plate === 1.25 ? 'text-slate-800' : 'text-[var(--color-white)]'}`}>
                 {plate}
               </span>
             </motion.div>
           ))}
           {/* Left Clip */}
           <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: plates.length * 0.05, type: "spring", stiffness: 400, damping: 30 }}
              className="w-3 h-8 ml-1 bg-[var(--color-slate-800)] rounded-sm border-x border-[var(--color-slate-700)] flex items-center justify-center shadow-lg"
           >
             <div className="w-full h-1.5 bg-slate-400" />
           </motion.div>
         </div>

         {/* Left Collar */}
         <div className="w-5 h-14 bg-gradient-to-b from-slate-200 to-slate-400 rounded-sm shrink-0 shadow-md z-20 scale-x-[-1]" />

         {/* Left Sleeve */}
         <div className="absolute right-[50%] w-[1000px] h-4 bg-gradient-to-b from-slate-200 to-slate-400 border-y border-slate-400 top-1/2 -translate-y-1/2 z-0 scale-x-[-1]" />

         {/* Center shaft - full width span under collars */}
         <div className="absolute left-[-1000px] right-[-1000px] h-4 bg-gradient-to-b from-slate-300 to-slate-400 border-y border-slate-500 top-1/2 -translate-y-1/2 z-0" />

         {/* Center visual shaft snippet (visible part) */}
         <div className="w-16 h-4 bg-gradient-to-b from-slate-300 to-slate-400 border-y border-slate-500 shrink-0 z-10" />

         {/* Right Collar */}
         <div className="w-5 h-14 bg-gradient-to-b from-slate-200 to-slate-400 rounded-sm shrink-0 shadow-md z-20" />

         {/* Right Sleeve */}
         <div className="absolute left-[50%] w-[1000px] h-4 bg-gradient-to-b from-slate-200 to-slate-400 border-y border-slate-400 top-1/2 -translate-y-1/2 z-0" />

         {/* Right Plates container */}
         <div className="flex items-center justify-start gap-[1px] -ml-[2px] z-30 h-full">
           {plates.map((plate, idx) => (
             <motion.div
               key={`R-${plate}-${idx}`}
               initial={{ x: 100, opacity: 0, rotateY: 45 }}
               animate={{ x: 0, opacity: 1, rotateY: 0 }}
               transition={{ delay: idx * 0.05, type: "spring", stiffness: 400, damping: 25 }}
               className={`rounded-[2px] flex items-center justify-center relative shadow-sm ${getPlateStyle(plate)}`}
             >
               <span className={`text-[10px] font-black tracking-tighter -rotate-90 absolute ${plate === 5 || plate === 1.25 ? 'text-slate-800' : 'text-[var(--color-white)]'}`}>
                 {plate}
               </span>
             </motion.div>
           ))}
           {/* Right Clip / Collar */}
           <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: plates.length * 0.05, type: "spring", stiffness: 400, damping: 30 }}
              className="w-3 h-8 ml-1 bg-[var(--color-slate-800)] rounded-sm border-x border-[var(--color-slate-700)] flex items-center justify-center shadow-lg"
           >
             <div className="w-full h-1.5 bg-slate-400" />
           </motion.div>
         </div>
       </div>
    </div>
  );
};
