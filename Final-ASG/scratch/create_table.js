import postgres from 'postgres';

const DATABASE_URL = 'postgresql://postgres.mdrqhrmmcjqutcmvqcvf:gqBICGwE9B4mKTMS@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

const sql = postgres(DATABASE_URL);

async function main() {
  console.log('Creating testimonials table in Supabase...');
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS testimonials (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        company TEXT,
        avatar TEXT,
        content TEXT NOT NULL,
        rating INTEGER DEFAULT 5 NOT NULL,
        status TEXT DEFAULT 'Active' NOT NULL,
        display_order INTEGER DEFAULT 0 NOT NULL,
        show_on_website BOOLEAN DEFAULT true NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ testimonials table created successfully!');
  } catch (err) {
    console.error('❌ Failed to create testimonials table:', err);
  } finally {
    await sql.end();
  }
}

main();
