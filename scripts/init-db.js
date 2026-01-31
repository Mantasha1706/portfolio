const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'makerfest.db');
const db = new Database(dbPath);

console.log('Initializing database at:', dbPath);

const createTableQuery = `
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    class TEXT,
    project_title TEXT,
    problem_statement TEXT,
    project_idea TEXT,
    materials TEXT,
    working TEXT,
    challenges TEXT,
    learned TEXT,
    future TEXT,
    image_path TEXT,
    poster_config TEXT,
    status TEXT DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

try {
  db.exec(createTableQuery);
  console.log('Database initialized successfully. "projects" table is ready.');
} catch (error) {
  console.error('Error initializing database:', error);
}

db.close();
