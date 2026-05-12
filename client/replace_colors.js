import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replacements
  content = content.replace(/text-\[#111111\]/g, 'text-[var(--text-main)]');
  content = content.replace(/bg-\[#111111\]/g, 'bg-[var(--accent)]');
  content = content.replace(/border-\[#111111\]/g, 'border-[var(--accent)]');
  content = content.replace(/hover:text-\[#111111\]/g, 'hover:text-[var(--text-main)]');
  content = content.replace(/hover:border-\[#111111\]/g, 'hover:border-[var(--accent)]');
  
  content = content.replace(/text-\[#666666\]/g, 'text-[var(--text-muted)]');
  content = content.replace(/bg-\[#666666\]/g, 'bg-[var(--text-muted)]');
  
  content = content.replace(/text-\[#F0EFE9\]/g, 'text-[var(--accent-fg)]');
  content = content.replace(/bg-\[#F0EFE9\]/g, 'bg-[var(--accent-fg)]');
  
  content = content.replace(/bg-\[#F5F5F5\]/g, 'bg-[var(--card-muted)]');
  content = content.replace(/text-\[#F5F5F5\]/g, 'text-[var(--card-muted)]');
  
  content = content.replace(/hover:bg-\[#333333\]/g, 'hover:bg-[var(--accent-hover)]');

  fs.writeFileSync(file, content);
});

console.log('Replacement complete.');
