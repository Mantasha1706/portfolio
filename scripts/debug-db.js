const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'makerfest.db');
const db = new Database(dbPath);

const rows = db.prepare('SELECT id, email, status FROM projects').all();
console.log('Current DB State:', JSON.stringify(rows, null, 2));
