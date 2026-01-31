// Migration script to add Cloudinary columns to projects table
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'makerfest.db');
const db = new Database(dbPath);

console.log('Running database migration...');

try {
    // Add cloudinary_url column
    db.prepare(`
        ALTER TABLE projects 
        ADD COLUMN cloudinary_url TEXT
    `).run();
    console.log('✓ Added cloudinary_url column');
} catch (error) {
    if (error.message.includes('duplicate column name')) {
        console.log('⚠ cloudinary_url column already exists');
    } else {
        console.error('✗ Error adding cloudinary_url:', error.message);
    }
}

try {
    // Add cloudinary_public_id column
    db.prepare(`
        ALTER TABLE projects 
        ADD COLUMN cloudinary_public_id TEXT
    `).run();
    console.log('✓ Added cloudinary_public_id column');
} catch (error) {
    if (error.message.includes('duplicate column name')) {
        console.log('⚠ cloudinary_public_id column already exists');
    } else {
        console.error('✗ Error adding cloudinary_public_id:', error.message);
    }
}

db.close();
console.log('Migration complete!');
