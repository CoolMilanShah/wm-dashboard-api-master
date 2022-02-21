//import { Pool } from "postgresql-client";
import { Pool } from "pg";
/*
const pool = new Pool({
  host: "wmdashboard.crybpzwbtu0u.us-west-2.rds.amazonaws.com",
  database: "wmdashboard",
  user: "postgres",
  password: "abcd1234",
  connectionTimeoutMillis: process.env.DB_CONNECTTIMEOUT || 0,
  min: 1,
  keepAlive: true
});
*/

const pool = new Pool({

  user: "postgres",
  host: "localhost",
  database: "wmdashboard_Local",
  password: "AAAA@1234",
  port: 5432,
});

export default pool;
