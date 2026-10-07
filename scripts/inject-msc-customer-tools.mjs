import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const file=path.resolve('public/prototipos/msc-safety/ventas/index.html');
let html=await readFile(file,'utf8');
const tag='<script src="/api/msc-customer-tools"></script>';
if(!html.includes(tag))html=html.replace('</body>',tag+'\n</body>');
await writeFile(file,html,'utf8');
console.log('MSC Safety customer tools injected into sales app.');
