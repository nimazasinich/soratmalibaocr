import { Database } from 'sqlite';
import DatabaseManager from '../utils/database';

export interface FinancialStatement {
  id?: number;
  company_id: number;
  period: string;

  // Balance Sheet
  assets: number;
  liabilities: number;
  equity?: number;
  current_assets?: number;
  current_liabilities?: number;
  fixed_assets?: number;
  inventory?: number;
  cash?: number;
  accounts_receivable?: number;
  retained_earnings?: number;

  // Income Statement
  revenue?: number;
  cogs?: number;
  gross_profit?: number;
  operating_expenses?: number;
  ebit?: number;
  ebitda?: number;
  interest_expense?: number;
  tax_expense?: number;
  net_income?: number;

  // Cash Flow
  operating_cf?: number;
  investing_cf?: number;
  financing_cf?: number;

  created_at?: string;
  updated_at?: string;
}

export class FinancialStatementRepository {
  private db: Database | null = null;

  private async getDb(): Promise<Database> {
    if (!this.db) {
      this.db = await DatabaseManager.getConnection();
    }
    return this.db;
  }

  /**
   * Create a new financial statement
   */
  async create(statement: FinancialStatement): Promise<number> {
    const db = await this.getDb();

    const fields = Object.keys(statement).filter((k) => k !== 'id');
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map((k) => statement[k as keyof FinancialStatement]);

    const result = await db.run(
      `INSERT INTO financial_statements (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    return result.lastID!;
  }

  /**
   * Find statement by ID
   */
  async findById(id: number): Promise<FinancialStatement | null> {
    const db = await this.getDb();

    const statement = await db.get<FinancialStatement>(
      `SELECT * FROM financial_statements WHERE id = ?`,
      [id]
    );

    return statement || null;
  }

  /**
   * Find all statements for a company
   */
  async findByCompanyId(companyId: number): Promise<FinancialStatement[]> {
    const db = await this.getDb();

    const statements = await db.all<FinancialStatement[]>(
      `SELECT * FROM financial_statements WHERE company_id = ? ORDER BY period DESC`,
      [companyId]
    );

    return statements;
  }

  /**
   * Find statement by company and period
   */
  async findByCompanyAndPeriod(
    companyId: number,
    period: string
  ): Promise<FinancialStatement | null> {
    const db = await this.getDb();

    const statement = await db.get<FinancialStatement>(
      `SELECT * FROM financial_statements WHERE company_id = ? AND period = ?`,
      [companyId, period]
    );

    return statement || null;
  }

  /**
   * Get all statements with company info
   */
  async findAllWithCompany(): Promise<any[]> {
    const db = await this.getDb();

    const statements = await db.all(
      `SELECT
        fs.*,
        c.name as company_name,
        c.sector as company_sector
      FROM financial_statements fs
      JOIN companies c ON fs.company_id = c.id
      ORDER BY fs.created_at DESC`
    );

    return statements;
  }

  /**
   * Update statement
   */
  async update(id: number, statement: Partial<FinancialStatement>): Promise<boolean> {
    const db = await this.getDb();

    const fields: string[] = [];
    const values: any[] = [];

    Object.keys(statement).forEach((key) => {
      if (key !== 'id' && statement[key as keyof FinancialStatement] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(statement[key as keyof FinancialStatement]);
      }
    });

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    if (fields.length === 0) {
      return false;
    }

    const result = await db.run(
      `UPDATE financial_statements SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return (result.changes || 0) > 0;
  }

  /**
   * Delete statement
   */
  async delete(id: number): Promise<boolean> {
    const db = await this.getDb();

    const result = await db.run(`DELETE FROM financial_statements WHERE id = ?`, [id]);

    return (result.changes || 0) > 0;
  }

  /**
   * Get historical statements for trend analysis
   */
  async getHistoricalStatements(
    companyId: number,
    limit: number = 5
  ): Promise<FinancialStatement[]> {
    const db = await this.getDb();

    const statements = await db.all<FinancialStatement[]>(
      `SELECT * FROM financial_statements
       WHERE company_id = ?
       ORDER BY period DESC
       LIMIT ?`,
      [companyId, limit]
    );

    return statements;
  }

  /**
   * Calculate equity if not provided
   */
  async calculateEquity(id: number): Promise<number> {
    const statement = await this.findById(id);

    if (!statement) {
      throw new Error('Statement not found');
    }

    const equity = statement.assets - statement.liabilities;

    await this.update(id, { equity });

    return equity;
  }

  /**
   * Calculate gross profit if not provided
   */
  async calculateGrossProfit(id: number): Promise<number | null> {
    const statement = await this.findById(id);

    if (!statement || !statement.revenue || !statement.cogs) {
      return null;
    }

    const grossProfit = statement.revenue - statement.cogs;

    await this.update(id, { gross_profit: grossProfit });

    return grossProfit;
  }
}

export default FinancialStatementRepository;
