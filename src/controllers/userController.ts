import { Request, Response } from "express";
import { db } from "../config/db";

// ดึงผู้ใช้ทั้งหมด
export const getUsers = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    res.json(rows);
  } catch (err: any) {
  console.error("❌ DB Error:", err); // log ทั้ง object
  res.status(500).json({ 
    error: err?.message || "Internal server error",
    details: err // ส่งทั้ง object กลับไปเลย
  });
}
};

// เพิ่มผู้ใช้ใหม่
export const addUser = async (req: Request, res: Response) => {
  const { username, password, full_name, email, role, wallet } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }

  try {
    const [result] = await db.query(
      `INSERT INTO users (username, password, full_name, email, role, wallet) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, password, full_name || null, email || null, role || "member", wallet || 0]
    );

    res.json({ message: "User created", id: (result as any).insertId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

