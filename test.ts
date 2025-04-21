import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Hello from TypeScript!');
console.log('__filename:', __filename);
console.log('__dirname:', __dirname);
