const fs = require('fs');

let et = fs.readFileSync('src/components/ExerciseTiers.tsx', 'utf8');

const newLogic = \
const getTierInfo = (name: string, weight: number) => {
  const tiers = [
    { name: "Wood", max: 20 },
    { name: "Bronze", max: 40 },
    { name: "Iron", max: 60 },
    { name: "Gold", max: 80 },
    { name: "Diamond", max: 120 },
    { name: "Titan", max: 9999 }
  ];
  
  let currentTier = tiers[0];
  let previousMax = 0;
  let nextMax = 20;

  for (let i = 0; i < tiers.length; i++) {
    if (weight < tiers[i].max) {
      currentTier = tiers[i];
      nextMax = tiers[i].max;
      previousMax = i > 0 ? tiers[i-1].max : 0;
      break;
    }
  }

  if (currentTier.name === "Titan") {
    return { tier: "Titan", current: weight, target: weight, progress: 100 };
  }

  const range = nextMax - previousMax;
  const progressWithinRange = weight - previousMax;
  const progressPercent = Math.max(5, Math.min(100, Math.round((progressWithinRange / range) * 100)));

  return { tier: currentTier.name, current: weight, target: nextMax, progress: progressPercent };
};
\;

et = et.replace(/const getTierInfo = [\s\S]*?progress: 100 \};\n\};/, newLogic);

// Add text to the progress bar section
et = et.replace(/<div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mt-3 z-10 relative">[\s\S]*?<\/div>\s*<\/div>/, 
\<div className="flex justify-between items-center mt-3 mb-1 px-1">
                <span className="text-xs font-bold text-[var(--color-slate-500)]">{info.current} {info.tier === "Titan" ? "kg" : ""}</span>
                {info.tier !== "Titan" && <span className="text-xs font-bold text-[var(--color-slate-500)]">{info.target} kg to next</span>}
              </div>
              <div className="h-3 w-full bg-[var(--color-gray-100)] rounded-full overflow-hidden z-10 relative shadow-inner">
                <div
                  className="h-full bg-[var(--color-indigo-400)] rounded-full transition-all duration-1000"
                  style={{ width: \\\\%\\\\} }
                />
              </div>
            </div>\);
            
fs.writeFileSync('src/components/ExerciseTiers.tsx', et);
