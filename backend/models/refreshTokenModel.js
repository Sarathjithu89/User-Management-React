const initDatabase = require("../config/database");

class RefreshToken {
  static async getPool() {
    if (!this.pool) {
      this.pool = await initDatabase();
    }
    return this.pool;
  }

  static async initTable() {
    const db = await this.getPool();
    await db.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        token VARCHAR(500) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_token (token(255)),
        INDEX idx_user_id (user_id)
      )
    `);
    console.log("refresh_tokens table checked");
  }

  static async create(userId, token, expiresAt) {
    const db = await this.getPool();
    const [result] = await db.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [userId, token, expiresAt]
    );
    return result.insertId;
  }

  // Find refresh token
  static async findByToken(token) {
    const db = await this.getPool();
    const [rows] = await db.query(
      "SELECT * FROM refresh_tokens WHERE token = ?",
      [token]
    );
    return rows[0];
  }

  static async deleteByToken(token) {
    const db = await this.getPool();
    const [result] = await db.query(
      "DELETE FROM refresh_tokens WHERE token = ?",
      [token]
    );
    return result.affectedRows > 0;
  }

  static async deleteAllByUserId(userId) {
    const db = await this.getPool();
    const [result] = await db.query(
      "DELETE FROM refresh_tokens WHERE user_id = ?",
      [userId]
    );
    return result.affectedRows;
  }

  // Delete expired
  static async deleteExpired() {
    const db = await this.getPool();
    const [result] = await db.query(
      "DELETE FROM refresh_tokens WHERE expires_at < NOW()"
    );
    return result.affectedRows;
  }

  static async findByUserId(userId) {
    const db = await this.getPool();
    const [rows] = await db.query(
      "SELECT * FROM refresh_tokens WHERE user_id = ?",
      [userId]
    );
    return rows;
  }

  static async countByUserId(userId) {
    const db = await this.getPool();
    const [rows] = await db.query(
      "SELECT COUNT(*) as count FROM refresh_tokens WHERE user_id = ? AND expires_at > NOW()",
      [userId]
    );
    return rows[0].count;
  }
}

module.exports = RefreshToken;
