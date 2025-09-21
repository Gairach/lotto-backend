"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./config/db");
async function testDbConnection() {
    try {
        const [rows] = await db_1.db.query("SELECT 1");
        console.log("✅ DB connected:", rows);
    }
    catch (err) {
        console.error("❌ DB connection error:", err.message);
    }
}
testDbConnection();
//# sourceMappingURL=testDb.js.map