"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllData = exports.isAdmin = void 0;
const db_1 = require("../config/db");
// Middleware ตรวจสอบ admin
const isAdmin = async (req, res, next) => {
    try {
        const userId = Number(req.headers['x-user-id']); // userId ส่งมาผ่าน header
        if (!userId)
            return res.status(400).json({ error: "Missing userId" });
        const [rows] = await db_1.db.query("SELECT role FROM users WHERE user_id = ?", [userId]);
        if (!rows[0])
            return res.status(404).json({ error: "User not found" });
        if (rows[0].role !== "admin")
            return res.status(403).json({ error: "Access denied" });
        next();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
exports.isAdmin = isAdmin;
// ลบข้อมูลทั้งหมด (admin เท่านั้น)
const deleteAllData = async (req, res) => {
    try {
        // ลบ claims, prizes, purchases, lotto_tickets, draws
        await db_1.db.query("DELETE FROM claims");
        await db_1.db.query("DELETE FROM prizes");
        await db_1.db.query("DELETE FROM purchases");
        await db_1.db.query("DELETE FROM lotto_tickets");
        await db_1.db.query("DELETE FROM draws");
        // ลบ users ที่เป็น member เท่านั้น
        await db_1.db.query("DELETE FROM users WHERE role = 'member'");
        // รีเซ็ต AUTO_INCREMENT สำหรับตารางที่เกี่ยวข้อง
        await db_1.db.query("ALTER TABLE claims AUTO_INCREMENT = 1");
        await db_1.db.query("ALTER TABLE prizes AUTO_INCREMENT = 1");
        await db_1.db.query("ALTER TABLE purchases AUTO_INCREMENT = 1");
        await db_1.db.query("ALTER TABLE lotto_tickets AUTO_INCREMENT = 1");
        await db_1.db.query("ALTER TABLE draws AUTO_INCREMENT = 1");
        await db_1.db.query("ALTER TABLE users AUTO_INCREMENT = 2"); // เริ่มจาก 2 เพราะ admin id = 1
        res.json({ success: true, message: "ลบข้อมูลทั้งหมดสำหรับสมาชิกสำเร็จ" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
};
exports.deleteAllData = deleteAllData;
//# sourceMappingURL=cleardataControlle.js.map