import postgres from 'postgres';

const sql = postgres('postgresql://postgres.mdrqhrmmcjqutcmvqcvf:gqBICGwE9B4mKTMS@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres');

async function check() {
  try {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'interns';
    `;
    console.log("INTERNS COLUMNS IN DB:", columns);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

check();
