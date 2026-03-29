const fs = require('fs');

let layout = fs.readFileSync('src/app/(app)/layout.tsx', 'utf8');
layout = layout.replace(/bg-gray-50 dark:bg-background/g, 'bg-transparent');
layout = layout.replace(/min-h-screen/g, 'min-h-full'); // prevent nested screens causing black spots
fs.writeFileSync('src/app/(app)/layout.tsx', layout);

let dash = fs.readFileSync('src/app/(app)/dashboard/page.tsx', 'utf8');
dash = dash.replace(/min-h-screen/g, 'min-h-full');
// dash = dash.replace(/bg-gray-50/g, 'bg-transparent');
fs.writeFileSync('src/app/(app)/dashboard/page.tsx', dash);

let raw = fs.readFileSync('src/components/ActiveWorkout.tsx', 'utf8');
raw = raw.replace(/min-h-screen/g, 'min-h-full h-full');
raw = raw.replace(/bg-gray-50/g, 'bg-transparent');
fs.writeFileSync('src/components/ActiveWorkout.tsx', raw);
