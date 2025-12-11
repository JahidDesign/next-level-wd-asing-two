import { Pool, QueryResult, QueryResultRow } from "pg";
import config from "../config/env";

const connectionString = config.db.connectionString ?? "";

if (!connectionString) throw new Error("DATABASE_URL is not defined");

const isLocalHost = (cs: string) =>
  /@(localhost|127\.0\.0\.1|::1)(:|\/|$)/i.test(cs) ||
  /^postgres(?:ql)?:\/\/(localhost|127\.0\.0\.1|::1)/i.test(cs);

const ssl = isLocalHost(connectionString) ? false : { rejectUnauthorized: false };

const pool = new Pool({ connectionString, ssl });

export const query = async <T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: any[]
) => pool.query<T>(text, params);

export default pool;
