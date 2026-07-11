import { createTransactionsTable } from '../src/infrastructure/migrations/001-create-transactions-table';

async function runMigrations(): Promise<void> {
  console.log('='.repeat(50));
  console.log('🗄️  DynamoDB Migrations Runner');
  console.log('='.repeat(50));

  try {
    await createTransactionsTable();

    console.log('\n' + '='.repeat(50));
    console.log('✅ All migrations completed successfully!');
    console.log('='.repeat(50));
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
