const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory && f !== 'node_modules' && f !== '.next') {
      walkDir(dirPath, callback);
    } else if (!isDirectory && dirPath.endsWith('.tsx')) {
      callback(path.join(dirPath));
    }
  });
}

const dir = 'src';
walkDir(dir, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace hardcoded blues
  content = content.replace(/#2563eb/gi, 'var(--color-indigo-600)');
  content = content.replace(/#2563EB/gi, 'var(--color-indigo-600)');
  
  // Replace white/gray borders or shadows that are theme(...)
  content = content.replace(/theme\(colors\.([a-zA-Z0-9_-]+)\.([0-9]+)\)/g, 'var(--color--)');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed shadows in', filePath);
  }
});
