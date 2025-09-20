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

export const getUserById = async (req: Request, res: Response) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ error: "User ID required" });
  }

  try {
    // ใช้ user_id แทน id
    const [rows]: any = await db.query(
      "SELECT user_id, username, email, full_name, role, wallet FROM users WHERE user_id = ?",
      [userId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Error getUserById:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
