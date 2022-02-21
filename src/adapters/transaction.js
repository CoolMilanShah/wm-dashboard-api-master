import pool from "./pool";

export default async function transaction(queryText, queryValue) {
  const client = await pool.connect();
  await client.query("BEGIN");
  try {
    const result = await client.query(queryText, queryValue);

    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
