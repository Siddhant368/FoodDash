const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/admin/delivery/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace dark backgrounds with light
content = content.replace(/bg-\[\#080706\]/g, 'bg-[#FAFAF8]');
content = content.replace(/bg-\[\#100d0a\]/g, 'bg-white');
content = content.replace(/bg-\[\#090807\]/g, 'bg-[#FAFAF8]');
content = content.replace(/bg-\[\#0c0b09\]/g, 'bg-white');
content = content.replace(/bg-white\/\[0\.025\]/g, 'bg-gray-50');
content = content.replace(/bg-white\/\[0\.03\]/g, 'bg-gray-50');
content = content.replace(/bg-white\/\[0\.06\]/g, 'bg-gray-100');
content = content.replace(/border-white\/10/g, 'border-gray-100');
content = content.replace(/text-gray-400/g, 'text-gray-500');
content = content.replace(/text-gray-600/g, 'text-gray-500');
content = content.replace(/text-white\/30/g, 'text-gray-400');
content = content.replace(/border-white\/30/g, 'border-gray-300');
content = content.replace(/border-t-white/g, 'border-t-gray-800');

// Fix text colors
content = content.replace(/text-zinc-800/g, 'text-[#111111]');
content = content.replace(/text-orange-300/g, 'text-orange-700');
content = content.replace(/text-orange-200/g, 'text-orange-600');
content = content.replace(/text-amber-300/g, 'text-amber-700');
content = content.replace(/text-emerald-300/g, 'text-emerald-700');
content = content.replace(/text-red-300/g, 'text-red-700');
content = content.replace(/text-gray-300/g, 'text-gray-700');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Delivery page theme fixed.');
