import {cp} from 'node:fs/promises';
await cp('out','public',{recursive:true});
console.log('Next.js homepage merged with existing public routes.');
