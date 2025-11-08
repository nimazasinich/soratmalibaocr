#!/usr/bin/env ts-node

import DatabaseManager from '../utils/database';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

async function initializeDatabase() {
  console.log('🚀 Starting database initialization...\n');

  try {
    // Initialize database
    await DatabaseManager.initialize();

    // Health check
    const isHealthy = await DatabaseManager.healthCheck();

    if (!isHealthy) {
      throw new Error('Database health check failed');
    }

    console.log('✅ Database health check passed\n');

    // Get statistics
    const stats = await DatabaseManager.getStats();

    console.log('📊 Database Statistics:');
    console.log(`   Companies: ${stats.companies}`);
    console.log(`   Financial Statements: ${stats.statements}`);
    console.log(`   Ratios: ${stats.ratios}`);
    console.log(`   Fraud Indicators: ${stats.fraudIndicators}`);
    console.log(`   Risk Assessments: ${stats.riskAssessments}`);
    console.log(`   OCR Documents: ${stats.ocrDocuments}`);
    console.log(`   Users: ${stats.users}`);

    console.log('\n✅ Database initialized successfully!');

    await DatabaseManager.close();

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error);
    await DatabaseManager.close();
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  initializeDatabase();
}

export default initializeDatabase;
