const mysql = require('mysql2/promise');

async function migrate() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'sodic_guard_connect'
    });

    console.log('Connected to database. Creating table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS incidents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        incident_uid VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        dispatch_to VARCHAR(100) DEFAULT 'Head of Security Operations',
        created_by_user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by_user_id) REFERENCES users(id)
      );
    `);

    console.log('Incidents table created successfully.');
    await connection.end();
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
