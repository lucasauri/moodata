const fs = require('fs');
const path = require('path');

const checkDir = (dir) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      checkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(/from\s+['"](\.[^'"]+)['"]/g);
      if (matches) {
        matches.forEach(m => {
          const importPath = m.match(/['"](.*)['"]/)[1];
          const resolvedDir = path.dirname(fullPath);
          const targetPath = path.resolve(resolvedDir, importPath);
          try {
            const dirName = path.dirname(targetPath);
            const baseName = path.basename(targetPath);
            if (fs.existsSync(dirName)) {
               const dirFiles = fs.readdirSync(dirName);
               const foundExact = dirFiles.find(f => f === baseName || f.replace(/\.[^/.]+$/, '') === baseName);
               
               if (!foundExact) {
                  // Let's do a case-insensitive search
                  const foundLower = dirFiles.find(f => f.toLowerCase() === baseName.toLowerCase() || f.replace(/\.[^/.]+$/, '').toLowerCase() === baseName.toLowerCase());
                  if (foundLower) {
                      console.log(`Case mismatch in ${fullPath}: imports '${importPath}', actual file is '${foundLower}'`);
                  }
               }
            }
          } catch (e) {}
        });
      }
    }
  });
};

checkDir('./src');
console.log('Case check complete.');
