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
        start_time DATETIME,
        end_time DATETIME,
        status VARCHAR(50) DEFAULT 'Open',
        device_serial VARCHAR(100),
        type VARCHAR(50) DEFAULT 'general',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by_user_id) REFERENCES users(id)
      );
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS incident_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        incident_id INT,
        action TEXT NOT NULL,
        performed_by_user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
      );
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS incident_attachments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        incident_id INT,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
      );
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS incident_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        incident_id INT,
        old_status VARCHAR(50),
        new_status VARCHAR(50),
        changed_by_user_id INT,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
      );
    `);

    console.log('Incidents table created successfully.');
    await connection.end();
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
