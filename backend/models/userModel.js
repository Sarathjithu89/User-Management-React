const db = require("../config/database");

class User {
  static async create(userData) {
    const { name, email, password, role = "user" } = userData;
    const [result] = await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, password, role]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.query(
      "SELECT id, name, email, role, phone, address, status, created_at FROM users WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  static async update(id, userData) {
    const { name, email, phone, address } = userData;
    const [result] = await db.query(
      "UPDATE users SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?",
      [name, email, phone, address, id]
    );
    return result.affectedRows > 0;
  }

  static async findAll() {
    const [rows] = await db.query(
      "SELECT id, name, email, role, phone, address, status, created_at FROM users ORDER BY created_at DESC"
    );
    return rows;
  }

  static async updateRole(id, role) {
    const [result] = await db.query("UPDATE users SET role = ? WHERE id = ?", [
      role,
      id,
    ]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  static async getStats() {
    const [totalUsers] = await db.query("SELECT COUNT(*) as count FROM users");
    const [activeUsers] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE status = "active"'
    );
    const [newToday] = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURDATE()"
    );
    return {
      totalUsers: totalUsers[0].count,
      activeUsers: activeUsers[0].count,
      newToday: newToday[0].count,
    };
  }

  static async emailExists(email, excludedId = null) {
    let query = "SELECT COUNT(*) as count FROM users WHERE email = ?";
    let params = [email];
    if (excludedId) {
      query += " AND id != ?";
      params.push(excludedId);
    }
    const [rows] = await db.query(query, params);
    return rows[0].count > 0;
  }
}

module.exports = User;
