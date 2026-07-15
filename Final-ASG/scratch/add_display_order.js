import postgres from 'postgres';

async function main() {
  const sql = postgres(process.env.DATABASE_URL);
  try {
    await sql`ALTER TABLE problem_statements ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;`;
    console.log('Successfully added display_order column');
  } catch (err) {
    console.error('Failed to alter table:', err);
  } finally {
    await sql.end();
  }
}
main();
