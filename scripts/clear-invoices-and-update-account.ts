// Clear all invoices and update bank account number
import { turso } from '../lib/turso';

async function main() {
  try {
    console.log('🔄 Starting cleanup...');

    // 1. Count invoices before deletion
    const countBefore = await turso.execute('SELECT COUNT(*) as count FROM invoices');
    const invoiceCount = (countBefore.rows[0] as any).count;
    console.log(`📊 Found ${invoiceCount} invoices to delete`);

    // 2. Delete all invoices
    await turso.execute('DELETE FROM invoices');
    console.log('✅ All invoices deleted');

    // 3. Update bank account in company_settings
    const newBankAccount = '6424423004/5500';
    await turso.execute({
      sql: 'UPDATE company_settings SET bank_account = ? WHERE id = ?',
      args: [newBankAccount, 'weblyx']
    });
    console.log(`✅ Bank account updated to: ${newBankAccount}`);

    // 4. Verify changes
    const settings = await turso.execute('SELECT bank_account FROM company_settings WHERE id = ?', ['weblyx']);
    if (settings.rows[0]) {
      console.log(`✅ Verified bank account: ${(settings.rows[0] as any).bank_account}`);
    }

    const countAfter = await turso.execute('SELECT COUNT(*) as count FROM invoices');
    const remainingCount = (countAfter.rows[0] as any).count;
    console.log(`✅ Invoices remaining: ${remainingCount}`);

    console.log('🎉 Cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

main();
