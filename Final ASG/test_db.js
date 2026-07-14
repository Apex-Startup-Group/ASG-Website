import postgres from 'postgres';
const sql = postgres('postgresql://postgres.mdrqhrmmcjqutcmvqcvf:gqBICGwE9B4mKTMS@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres');
sql`SELECT id, event_date, created_at, tags FROM gallery_albums LIMIT 5`.then(console.log).then(()=>process.exit(0));
