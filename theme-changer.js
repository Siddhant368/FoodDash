const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, 'app'),
  path.join(__dirname, 'components')
];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // General Theme Replacements (Dark to Light)
  content = content.replace(/bg-\[\#09090b\]/g, 'bg-zinc-50');
  content = content.replace(/bg-\[\#121214\]/g, 'bg-white');
  content = content.replace(/bg-\[\#18181b\]/g, 'bg-zinc-100');
  content = content.replace(/border-white\/\[0\.08\]/g, 'border-zinc-200');
  content = content.replace(/border-white\/\[0\.1\]/g, 'border-zinc-300');
  content = content.replace(/border-white\/\[0\.05\]/g, 'border-zinc-200');
  content = content.replace(/border-white\/\[0\.2\]/g, 'border-zinc-300');
  
  // Specific text replacements where appropriate (excluding some cases)
  // Be careful with blanket text-white to text-black as buttons might need white text
  // We'll do a basic replace for the main background texts
  content = content.replace(/text-white/g, 'text-zinc-900');
  content = content.replace(/text-zinc-300/g, 'text-zinc-600');
  content = content.replace(/text-zinc-400/g, 'text-zinc-500');
  
  // Fix cases where buttons SHOULD have white text if they are black buttons
  // But wait, the user said "not add the black any space" for admin/super-admin!
  
  if (filePath.includes('admin') || filePath.includes('super-admin')) {
    // Force completely no black in admin
    content = content.replace(/bg-black/g, 'bg-yellow-400');
    content = content.replace(/text-black/g, 'text-zinc-900'); 
    content = content.replace(/text-zinc-900/g, 'text-zinc-800'); // softer
    content = content.replace(/bg-zinc-900/g, 'bg-yellow-300');
    content = content.replace(/bg-zinc-800/g, 'bg-yellow-200');
    content = content.replace(/border-zinc-800/g, 'border-yellow-300');
  } else {
    // Fix up buttons in non-admin areas
    content = content.replace(/bg-black text-zinc-900/g, 'bg-black text-white');
    content = content.replace(/bg-zinc-800 text-zinc-900/g, 'bg-zinc-800 text-white');
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
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
console.log('Theme change complete.');
