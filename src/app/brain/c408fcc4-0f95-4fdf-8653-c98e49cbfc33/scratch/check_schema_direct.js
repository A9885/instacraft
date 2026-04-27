const mysql = require('mysql2/promise');

const DATABASE_URL = "mysql://root:@127.0.0.1:3306/gqklqnde_ishtacrafts";

async function checkSchema() {
  try {
    const connection = await mysql.createConnection(DATABASE_URL);
    
    console.log("--- products table ---");
    const [productsDesc] = await connection.query("DESCRIBE products");
    console.table(productsDesc);

    console.log("--- product_images table ---");
    const [imagesDesc] = await connection.query("DESCRIBE product_images");
    console.table(imagesDesc);

    console.log("--- product_tags table ---");
    const [tagsDesc] = await connection.query("DESCRIBE product_tags");
    console.table(tagsDesc);

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("Schema check failed:", error);
    process.exit(1);
  }
}

checkSchema();
