const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, 'app'),
  path.join(__dirname, 'components')
];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace all old yellows and the newly added Tailwind yellows with the specific hex
  content = content.replace(/bg-\[\#FFD83D\]/g, 'bg-[#FFE13C]');
  content = content.replace(/bg-yellow-400/g, 'bg-[#FFE13C]');
  content = content.replace(/bg-yellow-300/g, 'bg-[#FFE13C]');
  content = content.replace(/bg-yellow-200/g, 'bg-[#FFE13C]');
  content = content.replace(/text-yellow-400/g, 'text-[#FFE13C]');
  content = content.replace(/border-yellow-300/g, 'border-[#FFE13C]');
  
  // Also replace any orange with the brand yellow just in case that's what they meant by "any color of backed"
  content = content.replace(/bg-orange-500/g, 'bg-[#FFE13C]');
  content = content.replace(/text-orange-500/g, 'text-[#FFE13C]');
  content = content.replace(/text-orange-400/g, 'text-[#FFE13C]');
  content = content.replace(/border-orange-500/g, 'border-[#FFE13C]');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated color to #FFE13C: ${filePath}`);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

targetDirs.forEach(walkDir);
console.log('Brand color update complete.');
