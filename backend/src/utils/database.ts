import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import fs from 'fs';
import path from 'path';

export class DatabaseManager {
  private static instance: Database | null = null;

  /**
   * Get or create database connection
   */
  static async getConnection(): Promise<Database> {
    if (this.instance) {
      return this.instance;
    }

    const dbPath = process.env.DB_PATH || './database/finance.db';
    const dbDir = path.dirname(dbPath);

    // Ensure database directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.instance = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Enable foreign keys
    await this.instance.exec('PRAGMA foreign_keys = ON');

    return this.instance;
  }

  /**
   * Initialize database with schema
   */
  static async initialize(): Promise<void> {
    const db = await this.getConnection();
    const schemaPath = path.join(process.cwd(), '../database/schema.sql');

    try {
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      await db.exec(schema);
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  static async close(): Promise<void> {
    if (this.instance) {
      await this.instance.close();
      this.instance = null;
    }
  }

  /**
   * Run migrations
   */
  static async runMigrations(): Promise<void> {
    const db = await this.getConnection();
    const migrationsDir = path.join(process.cwd(), 'src/migrations');

    if (!fs.existsSync(migrationsDir)) {
      console.log('No migrations directory found');
      return;
    }

    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      if (file.endsWith('.sql')) {
        const migrationPath = path.join(migrationsDir, file);
        const migration = fs.readFileSync(migrationPath, 'utf-8');

        try {
          await db.exec(migration);
          console.log(`✅ Migration applied: ${file}`);
        } catch (error) {
          console.error(`❌ Failed to apply migration ${file}:`, error);
          throw error;
        }
      }
    }
  }

  /**
   * Health check
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const db = await this.getConnection();
      const result = await db.get('SELECT 1 as health');
      return result.health === 1;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Get database statistics
   */
  static async getStats(): Promise<Record<string, number>> {
    const db = await this.getConnection();

    const stats = {
      companies: 0,
      statements: 0,
      ratios: 0,
      fraudIndicators: 0,
      riskAssessments: 0,
      ocrDocuments: 0,
      users: 0,
    };

    const tables = [
      { key: 'companies', table: 'companies' },
      { key: 'statements', table: 'financial_statements' },
      { key: 'ratios', table: 'ratios' },
      { key: 'fraudIndicators', table: 'fraud_indicators' },
      { key: 'riskAssessments', table: 'risk_assessments' },
      { key: 'ocrDocuments', table: 'ocr_documents' },
      { key: 'users', table: 'users' },
    ];

    for (const { key, table } of tables) {
      const result = await db.get(`SELECT COUNT(*) as count FROM ${table}`);
      stats[key as keyof typeof stats] = result.count;
    }

    return stats;
  }
}

export default DatabaseManager;
