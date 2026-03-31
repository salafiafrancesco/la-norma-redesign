import 'dotenv/config';
import { cloneDefaultDb, replaceDatabase, save } from './database.js';
import { ensureInitialized } from './init.js';

replaceDatabase(cloneDefaultDb());
ensureInitialized();
save();

console.log('[seed] Database reset with fresh La Norma defaults.');
