const initDatabase = require("../config/database");

class User {
  static async getPool() {
    if (!this.pool) {
      this.pool = await initDatabase(); // init DB once
    }
    return this.pool;
  }

  static async create(userData) {
    const db = await this.getPool();
    const { name, email, password, department = "", role = "user" } = userData;
    const [result] = await db.query(
      "INSERT INTO users (name, email, password, department, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, password, department, role]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const db = await this.getPool();
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  static async findById(id) {
    const db = await this.getPool();
    const [rows] = await db.query(
      "SELECT id, name, email, role, phone, address, department, status, profile_picture_path ,created_at FROM users WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  static async update(id, userData) {
    const db = await this.getPool();
    const { name, email, phone, address, department } = userData;
    const [result] = await db.query(
      "UPDATE users SET name = ?, email = ?, phone = ?, address = ?, department = ? WHERE id = ?",
      [name, email, phone, address, department, id]
    );
    return result.affectedRows > 0;
  }

  static async findAll() {
    const db = await this.getPool();
    const [rows] = await db.query(
      "SELECT id, name, email, role, phone, address, department, status, created_at FROM users ORDER BY created_at DESC"
    );
    return rows;
  }

  static async updateRole(id, role) {
    const db = await this.getPool();
    const [result] = await db.query("UPDATE users SET role = ? WHERE id = ?", [
      role,
      id,
    ]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const db = await this.getPool();
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  static async getStats() {
    const db = await this.getPool();
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
  static async updateProfilePicturePath(id, imagePath) {
    const db = await this.getPool();
    const [result] = await db.query(
      "UPDATE users SET profile_picture_path = ? WHERE id = ?",
      [imagePath, id]
    );
    return result.affectedRows > 0;
  }

  static async getProfilePicturePath(id) {
    const db = await this.getPool();
    const [rows] = await db.query(
      "SELECT profile_picture_path FROM users WHERE id = ?",
      [id]
    );
    return rows[0]?.profile_picture_path || null;
  }

  static async emailExists(email, excludedId = null) {
    const db = await this.getPool();
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
