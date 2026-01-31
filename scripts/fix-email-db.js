const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'makerfest.db');
const db = new Database(dbPath);

try {
    // 1. Delete the bad entry if a good one somehow exists (unlikely given UNIQUE constraint but safe)
    // Actually, simply UPDATE the bad one.
    // The bad one has: email = 'student%40aischool.net'
    // We want: email = 'student@aischool.net', status = 'submitted'

    // Check if correct one exists first
    const existing = db.prepare("SELECT * FROM projects WHERE email = 'student@aischool.net'").get();

    if (existing) {
        // If correct one exists, just delete the bad one
        db.prepare("DELETE FROM projects WHERE email = 'student%40aischool.net'").run();
        console.log('Deleted bad entry (good one already existed).');
    } else {
        // Rename the bad one
        const info = db.prepare("UPDATE projects SET email = 'student@aischool.net', status = 'submitted' WHERE email = 'student%40aischool.net'").run();
        console.log('Fixed bad entry:', info.changes);
    }

} catch (e) {
    console.error(e);
}
