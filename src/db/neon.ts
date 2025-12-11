import { neon } from "@neondatabase/serverless";
import config from "../config/env";

const conn = config.db.connectionString;
if (!conn) throw new Error("DATABASE_URL missing");

export const sql = neon(conn);
export async function query<T = any>(tagged: any) {
 
  return tagged;
}

export default sql;
