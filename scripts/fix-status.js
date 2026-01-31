const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'makerfest.db');
const db = new Database(dbPath);

try {
    const info = db.prepare("UPDATE projects SET status = 'submitted' WHERE email = 'student@aischool.net'").run();
    console.log('Updated rows:', info.changes);
} catch (e) {
    console.error(e);
}
