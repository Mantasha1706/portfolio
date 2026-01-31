// Script to sync SQLite projects to Firebase
const Database = require('better-sqlite3');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');
const path = require('path');

const firebaseConfig = {
    databaseURL: "https://student-portfolio-fed9e-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firebaseDb = getDatabase(app);

// Open SQLite database
const dbPath = path.join(__dirname, '..', 'makerfest.db');
const db = new Database(dbPath);

async function syncToFirebase() {
    try {
        console.log('📊 Reading projects from SQLite...');
        const projects = db.prepare('SELECT * FROM projects').all();

        console.log(`Found ${projects.length} projects to sync`);

        for (const project of projects) {
            console.log(`  Syncing: ${project.project_title} (ID: ${project.id})`);

            const firebaseData = {
                id: project.id.toString(),
                email: project.email,
                name: project.name,
                class: project.class,
                project_title: project.project_title,
                problem_statement: project.problem_statement,
                project_idea: project.project_idea,
                materials: project.materials,
                working: project.working,
                challenges: project.challenges,
                learned: project.learned,
                future: project.future,
                image_path: project.image_path || '',
                poster_config: project.poster_config || '',
                status: project.status || 'draft',
                timestamp: Date.now()
            };

            const projectRef = ref(firebaseDb, `projects/${project.id}`);
            await set(projectRef, firebaseData);
            console.log(`    ✅ Synced project ${project.id}`);
        }

        console.log('\n✨ All projects synced to Firebase successfully!');
        console.log('🔗 Check: https://student-portfolio-fed9e-default-rtdb.asia-southeast1.firebasedatabase.app/');

        db.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    }
}

syncToFirebase();
