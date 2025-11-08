import { Database } from 'sqlite';
import DatabaseManager from '../utils/database';

export interface User {
  id?: number;
  username: string;
  email: string;
  password_hash?: string;
  role: 'admin' | 'analyst' | 'viewer';
  full_name?: string;
  is_active?: number;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export class UserRepository {
  private db: Database | null = null;

  private async getDb(): Promise<Database> {
    if (!this.db) {
      this.db = await DatabaseManager.getConnection();
    }
    return this.db;
  }

  /**
   * Create a new user
   */
  async create(user: User): Promise<number> {
    const db = await this.getDb();

    const result = await db.run(
      `INSERT INTO users (username, email, password_hash, role, full_name, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user.username, user.email, user.password_hash, user.role, user.full_name, 1]
    );

    return result.lastID!;
  }

  /**
   * Find user by ID
   */
  async findById(id: number): Promise<User | null> {
    const db = await this.getDb();
    const user = await db.get<User>(`SELECT * FROM users WHERE id = ?`, [id]);
    return user || null;
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    const db = await this.getDb();
    const user = await db.get<User>(`SELECT * FROM users WHERE username = ?`, [username]);
    return user || null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const db = await this.getDb();
    const user = await db.get<User>(`SELECT * FROM users WHERE email = ?`, [email]);
    return user || null;
  }

  /**
   * Find all users
   */
  async findAll(): Promise<User[]> {
    const db = await this.getDb();
    const users = await db.all<User[]>(`SELECT * FROM users ORDER BY created_at DESC`);
    return users;
  }

  /**
   * Update user
   */
  async update(id: number, updates: Partial<User>): Promise<boolean> {
    const db = await this.getDb();

    const fields: string[] = [];
    const values: any[] = [];

    Object.keys(updates).forEach((key) => {
      if (key !== 'id' && updates[key as keyof User] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key as keyof User]);
      }
    });

    if (fields.length === 0) return false;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await db.run(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return (result.changes || 0) > 0;
  }

  /**
   * Update last login time
   */
  async updateLastLogin(id: number): Promise<void> {
    const db = await this.getDb();
    await db.run(`UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`, [id]);
  }

  /**
   * Delete user
   */
  async delete(id: number): Promise<boolean> {
    const db = await this.getDb();
    const result = await db.run(`DELETE FROM users WHERE id = ?`, [id]);
    return (result.changes || 0) > 0;
  }

  /**
   * Toggle user active status
   */
  async toggleActive(id: number): Promise<boolean> {
    const db = await this.getDb();
    const result = await db.run(
      `UPDATE users SET is_active = NOT is_active WHERE id = ?`,
      [id]
    );
    return (result.changes || 0) > 0;
  }

  /**
   * Check if username exists
   */
  async usernameExists(username: string): Promise<boolean> {
    const user = await this.findByUsername(username);
    return user !== null;
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }
}

export default UserRepository;
