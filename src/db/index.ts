import { Pool, QueryResult, QueryResultRow } from "pg";
import { config } from "../config/env";

export const pool = new Pool({
  connectionString: config.db.connectionString,
});

export const query = <T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  return pool.query<T>(text, params);
};

export const db = { query };
