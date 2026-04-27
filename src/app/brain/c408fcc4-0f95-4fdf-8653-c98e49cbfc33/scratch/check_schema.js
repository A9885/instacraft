const db = require('./src/lib/db').default;

async function checkSchema() {
  try {
    const productsDesc = await db.query("DESCRIBE products");
    console.log("--- products table ---");
    console.table(productsDesc);

    const imagesDesc = await db.query("DESCRIBE product_images");
    console.log("--- product_images table ---");
    console.table(imagesDesc);

    const tagsDesc = await db.query("DESCRIBE product_tags");
    console.log("--- product_tags table ---");
    console.table(tagsDesc);

    process.exit(0);
  } catch (error) {
    console.error("Schema check failed:", error);
    process.exit(1);
  }
}

checkSchema();
