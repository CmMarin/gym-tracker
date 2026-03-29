const fs = require('fs');

// SavedWorkoutsModal layout fix
let swm = fs.readFileSync('src/components/SavedWorkoutsModal.tsx', 'utf8');
swm = swm.replace('px-3 py-2 bg-red-50', 'px-3 py-1.5 bg-red-50');
swm = swm.replace('rounded-xl hover:bg-red-100 transition-colors font-bold text-sm', 'rounded-lg hover:bg-red-100 transition-colors font-bold text-xs');
fs.writeFileSync('src/components/SavedWorkoutsModal.tsx', swm);

// ExpandableWorkoutCard layout fix
let ewc = fs.readFileSync('src/components/ExpandableWorkoutCard.tsx', 'utf8');
// Convert outer button to div and wrap the header in button
ewc = ewc.replace(/<button\s+onClick=\{\(\) => setIsOpen\(!isOpen\)\}\s+className="w-full p-4 flex justify-between items-center text-left hover:bg-gray-100 transition-colors group"\s*>/g, 
  '<div className="w-full p-2 pr-4 flex justify-between items-center group"><button onClick={() => setIsOpen(!isOpen)} className="flex-1 text-left p-2 rounded-lg hover:bg-[var(--color-gray-100)] transition-colors focus:outline-none">');
ewc = ewc.replace(/<\/div>\s*<\/button>\s*<AnimatePresence>/g, 
  '</div></div><AnimatePresence>');
// Space out inner items
ewc = ewc.replace(/p-2 rounded-lg/g, 'p-3 rounded-lg border-b border-[var(--color-gray-100)] last:border-b-0');
fs.writeFileSync('src/components/ExpandableWorkoutCard.tsx', ewc);

// Fix ExerciseTiers red containers - make them neutral/indigo based on theme
let et = fs.readFileSync('src/components/ExerciseTiers.tsx', 'utf8');
et = et.replace(/ bg: "bg-\w+-\d+", border: "border-\w+-\d+"/g, ' bg: "bg-[var(--color-gray-100)]", border: "border-[var(--color-indigo-100)]"');
et = et.replace(/text-\w+-\d+(?=")/g, 'text-[var(--color-slate-700)]');
et = et.replace(/text-\w+-\d+(?= )/g, 'text-[var(--color-slate-700)]');
fs.writeFileSync('src/components/ExerciseTiers.tsx', et);

// Fix OneRM Select
let orm = fs.readFileSync('src/components/OneRepMaxWidget.tsx', 'utf8');
orm = orm.replace(/\{compoundData\.length > 1 && \([\s\S]*?<\/select>\n\s*\)\}/, '');
orm = orm.replace(/(<h2 className="text-xl font-bold.*<\/h2>)/, '\n        {compoundData.length > 1 && (\n          <select\n            value={selectedExercise}\n            onChange={(e) => setSelectedExercise(e.target.value)}\n            className="bg-[var(--color-gray-100)] text-[var(--color-slate-700)] font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--color-indigo-500)] text-sm mb-4"\n          >\n            {compoundData.map((d) => (\n              <option key={d.exercise} value={d.exercise}>\n                {d.exercise}\n              </option>\n            ))}\n          </select>\n        )}');
fs.writeFileSync('src/components/OneRepMaxWidget.tsx', orm);

// Fix CustomExercisesWidget
let cew = fs.readFileSync('src/components/CustomExercisesWidget.tsx', 'utf8');
cew = cew.replace(/bg-slate-50/g, 'bg-[var(--color-gray-50)]');
cew = cew.replace(/border-slate-100/g, 'border-[var(--color-gray-100)]');
fs.writeFileSync('src/components/CustomExercisesWidget.tsx', cew);

// Fix MuscleHeatmapWidget
let mhw = fs.readFileSync('src/components/MuscleHeatmapWidget.tsx', 'utf8');
mhw = mhw.replace(/bg-slate-100 text-slate-700/g, 'bg-[var(--color-indigo-100)] text-[var(--color-indigo-700)]');
fs.writeFileSync('src/components/MuscleHeatmapWidget.tsx', mhw);

// Fix ActiveWorkout Plate calculator text and End Workout button
let aw = fs.readFileSync('src/components/ActiveWorkout.tsx', 'utf8');
aw = aw.replace(/bg-slate-800/g, 'bg-[var(--color-indigo-600)]');
aw = aw.replace(/border-slate-700/g, 'border-[var(--color-indigo-700)]');
aw = aw.replace(/text-slate-300/g, 'text-[var(--color-indigo-100)]');
aw = aw.replace(/text-yellow-300/g, 'text-[var(--color-white)]');
// Center the header and add standard X for quit
aw = aw.replace(/<div className="w-full max-w-md flex items-center justify-between\s*mb-8">[\s\S]*?<button\s*onClick=\{async \(\) => {[\s\S]*?<\/button>\s*<\/div>/, '<div className="w-full max-w-md flex justify-center items-center mb-8 relative">\n          <h1 className="font-bold text-2xl text-[var(--color-slate-800)] text-center">{planName}</h1>\n          <button\n             onClick={async () => {\n               await cancelActiveWorkout();\n               window.location.href = "/workout";\n             }}\n             className="absolute right-0 top-0 text-[var(--color-slate-400)] hover:text-red-500 p-2">\n             <X size={24} />\n          </button>\n        </div>');
fs.writeFileSync('src/components/ActiveWorkout.tsx', aw);

