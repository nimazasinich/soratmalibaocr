import { Database } from 'sqlite';
import DatabaseManager from '../utils/database';

export interface Company {
  id?: number;
  name: string;
  sector?: string;
  fiscal_year?: number;
  created_at?: string;
  updated_at?: string;
}

export class CompanyRepository {
  private db: Database | null = null;

  private async getDb(): Promise<Database> {
    if (!this.db) {
      this.db = await DatabaseManager.getConnection();
    }
    return this.db;
  }

  /**
   * Create a new company
   */
  async create(company: Company): Promise<number> {
    const db = await this.getDb();

    const result = await db.run(
      `INSERT INTO companies (name, sector, fiscal_year) VALUES (?, ?, ?)`,
      [company.name, company.sector, company.fiscal_year]
    );

    return result.lastID!;
  }

  /**
   * Find company by ID
   */
  async findById(id: number): Promise<Company | null> {
    const db = await this.getDb();

    const company = await db.get<Company>(`SELECT * FROM companies WHERE id = ?`, [id]);

    return company || null;
  }

  /**
   * Find all companies
   */
  async findAll(filters?: { sector?: string; fiscal_year?: number }): Promise<Company[]> {
    const db = await this.getDb();
    let query = 'SELECT * FROM companies WHERE 1=1';
    const params: any[] = [];

    if (filters?.sector) {
      query += ' AND sector = ?';
      params.push(filters.sector);
    }

    if (filters?.fiscal_year) {
      query += ' AND fiscal_year = ?';
      params.push(filters.fiscal_year);
    }

    query += ' ORDER BY created_at DESC';

    const companies = await db.all<Company[]>(query, params);

    return companies;
  }

  /**
   * Update company
   */
  async update(id: number, company: Partial<Company>): Promise<boolean> {
    const db = await this.getDb();

    const fields: string[] = [];
    const values: any[] = [];

    if (company.name !== undefined) {
      fields.push('name = ?');
      values.push(company.name);
    }

    if (company.sector !== undefined) {
      fields.push('sector = ?');
      values.push(company.sector);
    }

    if (company.fiscal_year !== undefined) {
      fields.push('fiscal_year = ?');
      values.push(company.fiscal_year);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');

    if (fields.length === 0) {
      return false;
    }

    values.push(id);

    const result = await db.run(
      `UPDATE companies SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return (result.changes || 0) > 0;
  }

  /**
   * Delete company
   */
  async delete(id: number): Promise<boolean> {
    const db = await this.getDb();

    const result = await db.run(`DELETE FROM companies WHERE id = ?`, [id]);

    return (result.changes || 0) > 0;
  }

  /**
   * Search companies by name
   */
  async search(query: string): Promise<Company[]> {
    const db = await this.getDb();

    const companies = await db.all<Company[]>(
      `SELECT * FROM companies WHERE name LIKE ? ORDER BY name`,
      [`%${query}%`]
    );

    return companies;
  }

  /**
   * Get companies by sector
   */
  async getBySector(sector: string): Promise<Company[]> {
    const db = await this.getDb();

    const companies = await db.all<Company[]>(
      `SELECT * FROM companies WHERE sector = ? ORDER BY name`,
      [sector]
    );

    return companies;
  }

  /**
   * Get all unique sectors
   */
  async getAllSectors(): Promise<string[]> {
    const db = await this.getDb();

    const result = await db.all<{ sector: string }[]>(
      `SELECT DISTINCT sector FROM companies WHERE sector IS NOT NULL ORDER BY sector`
    );

    return result.map((r) => r.sector);
  }
}

export default CompanyRepository;
