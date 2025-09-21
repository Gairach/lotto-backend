"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.addUser = exports.getUsers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../config/db");
// ดึงผู้ใช้ทั้งหมด
const getUsers = async (req, res) => {
    try {
        const [rows] = await db_1.db.query("SELECT * FROM users");
        res.json(rows);
    }
    catch (err) {
        console.error("❌ DB Error:", err); // log ทั้ง object
        res.status(500).json({
            error: err?.message || "Internal server error",
            details: err // ส่งทั้ง object กลับไปเลย
        });
    }
};
exports.getUsers = getUsers;
// เพิ่มผู้ใช้ใหม่ (hash password ก่อนบันทึก)
const addUser = async (req, res) => {
    const { username, password, full_name, email, role, wallet } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }
    try {
        // hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        // บันทึกลงฐานข้อมูล
        const [result] = await db_1.db.query(`INSERT INTO users (username, password, full_name, email, role, wallet) 
       VALUES (?, ?, ?, ?, ?, ?)`, [username, hashedPassword, full_name || null, email || null, role || "member", wallet || 0]);
        res.json({ message: "User created", id: result.insertId });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.addUser = addUser;
const getUserById = async (req, res) => {
    const userId = req.params.id;
    if (!userId) {
        return res.status(400).json({ error: "User ID required" });
    }
    try {
        // ใช้ user_id แทน id
        const [rows] = await db_1.db.query("SELECT user_id, username, email, full_name, role, wallet FROM users WHERE user_id = ?", [userId]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(200).json(rows[0]);
    }
    catch (err) {
        console.error("Error getUserById:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.getUserById = getUserById;
//# sourceMappingURL=userController.js.map