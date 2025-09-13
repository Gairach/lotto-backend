import { db } from "./config/db";

async function testDbConnection() {
  try {
    const [rows] = await db.query("SELECT 1");
    console.log("✅ DB connected:", rows);
  } catch (err: any) {
    console.error("❌ DB connection error:", err.message);
  }
}

testDbConnection();
