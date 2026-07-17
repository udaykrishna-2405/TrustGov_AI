// Fix demo user password hashes in Supabase
// Correct hash for 'Admin@123'
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const CORRECT_HASH = '$2a$10$S7slw5l/cFWDUdoDZinOzehXcFidOuA/fo1tOqnLV78kDHdim4XvO';

const emails = [
  'admin@civicai.in',
  'admin@enterpriseai.in',
  'admin@industrialai.in',
];

async function fix() {
  console.log('🔧 Fixing password hashes for demo users...\n');
  for (const email of emails) {
    const { error } = await supabase
      .from('users')
      .update({ password_hash: CORRECT_HASH })
      .eq('email', email);
    if (error) {
      console.error(`  ❌ ${email}: ${error.message}`);
    } else {
      console.log(`  ✅ ${email} → hash updated`);
    }
  }
  console.log('\n✅ Done. Login with Admin@123 for all three users.');
  process.exit(0);
}

fix();
