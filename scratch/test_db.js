const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

require("dotenv").config({ path: ".env.local" });

const url = new URL(process.env.DATABASE_URL);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: parseInt(url.port) || 3306,
  user: url.username,
  password: url.password ? decodeURIComponent(url.password) : undefined,
  database: url.pathname.slice(1),
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });
async function main() {
  try {
    const counts = await Promise.all([
      prisma.testimonial.count(),
      prisma.product.count(),
      prisma.siteConfig.count(),
    ]);
    console.log("SUCCESS: Counts match:", counts);
  } catch (e) {
    console.error("FAILURE:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
