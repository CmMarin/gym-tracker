const fs = require('fs');
let css = fs.readFileSync('src/app/globals.css', 'utf8');

// Fix html and body height to remove black bottom
css = css.replace(/body \{[\s\S]*?\}/, 'html, body {\n  background: var(--color-gray-50);\n  color: var(--color-slate-800);\n  font-family: var(--font-sans), Arial, Helvetica, sans-serif;\n  transition: background-color 0.3s ease, color 0.3s ease;\n  min-height: 100%;\n}');

// Update baby blue theme
css = css.replace(/html\[data-theme="blue-dark"\] \{[\s\S]*?--color-rose-100:/,
html[data-theme="blue-dark"] {
  --color-white: #172a46;
  --color-gray-50: #0a1526;
  --color-gray-100: #122238;
  --color-gray-200: #1e3a5f;
  --color-slate-400: #93c5fd;
  --color-slate-500: #7dd3fc;
  --color-slate-700: #e0f2fe;
  --color-slate-800: #f0f9ff;

  --color-indigo-50: #082f49;
  --color-indigo-100: #0c4a6e;
  --color-indigo-200: #075985;
  --color-indigo-300: #0369a1;
  --color-indigo-400: #0ea5e9;
  --color-indigo-500: #7dd3fc;
  --color-indigo-600: #38bdf8;
  --color-indigo-700: #0284c7;
  --color-indigo-800: #e0f2fe;
  --color-indigo-900: #f0f9ff;

  --color-rose-100:);

fs.writeFileSync('src/app/globals.css', css);
