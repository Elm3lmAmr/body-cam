const db = require('../config/db');

exports.getUsers = async (req, res, next) => {
  try {
    const [users] = await db.execute('SELECT id, employee_code, full_name, role, mobile_number, last_login FROM users');
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { employee_code, full_name, password_hash, role, mobile_number } = req.body;
    const [result] = await db.execute(
      'INSERT INTO users (employee_code, full_name, password_hash, role, mobile_number) VALUES (?, ?, ?, ?, ?)',
      [employee_code, full_name, password_hash, role, mobile_number]
    );
    res.status(201).json({ id: result.insertId, message: 'User created successfully' });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, role, mobile_number } = req.body;
    await db.execute(
      'UPDATE users SET full_name = ?, role = ?, mobile_number = ? WHERE id = ?',
      [full_name, role, mobile_number, id]
    );
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
