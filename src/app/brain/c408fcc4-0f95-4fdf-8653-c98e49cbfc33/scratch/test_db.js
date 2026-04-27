const mysql = require('mysql2/promise');

const DATABASE_URL = "mysql://root:@127.0.0.1:3306/gqklqnde_ishtacrafts";

async function testQuery() {
  let connection;
  try {
    connection = await mysql.createConnection(DATABASE_URL);
    console.log("Connected to database");
    
    const [rows] = await connection.query("SELECT COUNT(*) as count FROM products");
    console.log("Product count:", rows[0].count);

    await connection.end();
  } catch (error) {
    console.error("Test query failed:", error.message);
    if (connection) await connection.destroy();
  }
}

testQuery();
