import { readFile, mkdir, rm, copyFile } from 'node:fs/promises';
import path from 'node:path';
const files = JSON.parse(await readFile(new URL('./public-files.json', import.meta.url), 'utf8'));
const root = path.resolve('.');
const output = path.join(root,'public');
await rm(output,{recursive:true,force:true});
for (const file of files) {
  if (file.includes('..') || file.startsWith('/') || /^(api|server|scripts|docs|docs-internos|supabase|evidencias)\//.test(file)) throw new Error('Invalid public file: '+file);
  if (!/\.(html|css|js|png|jpe?g|webp|svg|mp4|pdf|vtt|woff2)$/.test(file) && file !== 'assets/fonts/commissioner/OFL.txt') throw new Error('Invalid public extension');
  const destination = path.join(output,file);
  await mkdir(path.dirname(destination),{recursive:true});
  await copyFile(path.join(root,file),destination);
}
console.log(`Prepared ${files.length} public files. API code remains outside the public directory.`);
