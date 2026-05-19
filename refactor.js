const fs = require('fs');
const path = require('path');

const targetDir = '/Users/viniciussaldanharosario/DOCUMENTOS/PROJETOS/nbp-psicanalise';

const replacements = [
  { from: /cursos/g, to: 'cursos' },
  { from: /Cursos/g, to: 'Cursos' },
  { from: /CURSOS/g, to: 'CURSOS' },
  { from: /curso/g, to: 'curso' },
  { from: /Curso/g, to: 'Curso' },
  { from: /CURSO/g, to: 'CURSO' },
  { from: /course/g, to: 'course' },
  { from: /Course/g, to: 'Course' },
  { from: /COURSE/g, to: 'COURSE' },
  { from: /courses/g, to: 'courses' },
  { from: /Courses/g, to: 'Courses' },
  { from: /COURSES/g, to: 'COURSES' }
];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    callback(dirPath, isDirectory);
    if (isDirectory && !dirPath.includes('node_modules') && !dirPath.includes('.git') && !dirPath.includes('.next')) {
      walkDir(dirPath, callback);
    }
  });
}

// 1. Rename files and directories
let pathsToRename = [];
walkDir(targetDir, (filePath, isDir) => {
  const baseName = path.basename(filePath);
  if (baseName.toLowerCase().includes('curso') || baseName.toLowerCase().includes('course')) {
    pathsToRename.push({ path: filePath, isDir });
  }
});

// Sort by length descending to rename deepest first
pathsToRename.sort((a, b) => b.path.length - a.path.length);

pathsToRename.forEach(item => {
  const dirName = path.dirname(item.path);
  let newBaseName = path.basename(item.path);
  
  replacements.forEach(r => {
    newBaseName = newBaseName.replace(r.from, r.to);
  });
  
  const newPath = path.join(dirName, newBaseName);
  console.log(`Renaming ${item.path} to ${newPath}`);
  fs.renameSync(item.path, newPath);
});

// 2. Replace text in files
function replaceInFiles(dir) {
  walkDir(dir, (filePath, isDir) => {
    if (!isDir && !filePath.includes('node_modules') && !filePath.includes('.git') && !filePath.includes('.next') && !filePath.includes('.png') && !filePath.includes('.jpg') && !filePath.includes('.webp') && !filePath.includes('.svg') && !filePath.includes('.ico')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let newContent = content;
      replacements.forEach(r => {
        newContent = newContent.replace(r.from, r.to);
      });
      if (content !== newContent) {
        console.log(`Updated content in ${filePath}`);
        fs.writeFileSync(filePath, newContent, 'utf8');
      }
    }
  });
}

replaceInFiles(targetDir);
console.log('Refactoring complete.');
