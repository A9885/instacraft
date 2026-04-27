const db = require("./src/lib/db").default;
const { getDashboardAnalytics } = require("./src/lib/api-server");

async function test() {
  try {
    const data = await getDashboardAnalytics();
    console.log("Analytics Data:", JSON.stringify(data, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Test Error:", err);
    process.exit(1);
  }
}

test();
