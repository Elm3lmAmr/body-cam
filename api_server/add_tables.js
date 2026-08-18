const mysql = require('mysql2/promise');

async function migrate() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'sodic_guard_connect'
    });

    console.log('Connected to database. Creating tables...');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(50),
        message TEXT,
        source VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS recordings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        incident_id INT,
        guard_id VARCHAR(50),
        duration VARCHAR(50),
        url VARCHAR(255),
        is_bookmarked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tables created successfully.');
    await connection.end();
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
