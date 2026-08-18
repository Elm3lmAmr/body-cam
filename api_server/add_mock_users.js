const mysql = require('mysql2/promise');

async function addUsers() {
  try {
    const c = await mysql.createConnection({host:'127.0.0.1', user:'root', database:'sodic_guard_connect'});
    
    await c.query(`
      INSERT INTO users (employee_code, full_name, password_hash, role, mobile_number) 
      VALUES 
        ('OP001', 'Test Operator', '123456', 'operator', '0'), 
        ('MG001', 'Test Manager', '123456', 'manager', '0'), 
        ('AD001', 'Test IT Admin', '123456', 'it_admin', '0') 
      ON DUPLICATE KEY UPDATE role=VALUES(role)
    `);
    
    console.log('Users added successfully.');
    
    const [rows] = await c.query('SELECT employee_code, full_name, role, password_hash FROM users');
    console.log('Current Users:');
    console.table(rows);
    
    await c.end();
  } catch(e) {
    console.error(e);
  }
}

addUsers();
