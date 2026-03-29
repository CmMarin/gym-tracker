const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory() && !['node_modules', '.next'].includes(f)) {
      walkDir(dirPath, callback);
    } else if (dirPath.endsWith('.tsx')) {
      callback(path.join(dirPath));
    }
  });
}

walkDir('src', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Link shadows to theme color instead of gray
  content = content.replace(/shadow-\[0_4px_0_var\(--color-gray-200\)]/g, 'shadow-[0_4px_0_var(--color-indigo-100)]');
  
  // Link border of those containers to theme color as well
  content = content.replace(/border-gray-100/g, 'border-indigo-50');

  // Any bg-white to bg-[var(--color-white)] so it picks up my themes white var
  content = content.replace(/\bbg-white\b/g, 'bg-[var(--color-white)]');
  content = content.replace(/\bborder-white\b/g, 'border-[var(--color-white)]');
  content = content.replace(/\bring-white\b/g, 'ring-[var(--color-white)]');
  content = content.replace(/\btext-white\b/g, 'text-[var(--color-white)]');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
  }
});
