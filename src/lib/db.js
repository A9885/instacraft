// src/lib/db.js
import mysql from 'mysql2/promise';

const POOL_CONFIG = {
  uri: process.env.DATABASE_URL || '',
  waitForConnections: true,
  // Keep this LOW — XAMPP defaults to 151 max_connections total.
  // 3 is enough for local dev; Next.js queues extra queries.
  connectionLimit: process.env.NODE_ENV === 'production' ? 10 : 3,
  queueLimit: 50,
  enableKeepAlive: true,
  keepAliveInitialDelay: 30000,
  connectTimeout: 10000,
};

let pool;

if (process.env.NODE_ENV === 'production') {
  // Production: create a new pool per process (normal)
  pool = mysql.createPool(POOL_CONFIG);
} else {
  // Development: reuse the same pool across HMR reloads.
  // Without this, each hot reload creates a NEW pool, burning through connections.
  if (!global._mysqlPool) {
    global._mysqlPool = mysql.createPool(POOL_CONFIG);
  }
  pool = global._mysqlPool;
}

/**
 * Execute a SQL query and return the results.
 * @param {string} sql - The SQL query to execute.
 * @param {any[]} params - The parameters for the query.
 * @returns {Promise<any>}
 */
export async function query(sql, params) {
  if (!pool) throw new Error('Database not initialized');
  const [rows] = await pool.query(sql, params);
  return rows;
}

/**
 * Execute a function within a transaction.
 * @param {function(mysql.Connection): Promise<any>} callback - The function to execute.
 * @returns {Promise<any>}
 */
export async function transaction(callback) {
  if (!pool) throw new Error('Database not initialized');
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export default { query, transaction };
