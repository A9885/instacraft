import { getDashboardAnalytics } from "../src/lib/api-server.js";

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
