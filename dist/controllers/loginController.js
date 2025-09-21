"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Login = void 0;
const db_1 = require("../config/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const Login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบ" });
    }
    try {
        // ดึงผู้ใช้จากฐานข้อมูล
        const [rows] = await db_1.db.query("SELECT * FROM users WHERE username = ?", [username]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: "ไม่พบผู้ใช้" });
        }
        const user = rows[0];
        // ตรวจสอบรหัสผ่านด้วย bcrypt
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง" });
        }
        // Login สำเร็จ
        return res.status(200).json({
            message: "Login สำเร็จ",
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                wallet: user.wallet,
            },
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "เกิดข้อผิดพลาดจากระบบ" });
    }
};
exports.Login = Login;
//# sourceMappingURL=loginController.js.map