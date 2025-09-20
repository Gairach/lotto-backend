import { Request, Response } from "express";
import { db } from "../config/db";

// Middleware ตรวจสอบ admin
export const isAdmin = async (req: Request, res: Response, next: any) => {
  try {
    const userId = Number(req.headers['x-user-id']); // userId ส่งมาผ่าน header
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const [rows]: any = await db.query(
      "SELECT role FROM users WHERE user_id = ?",
      [userId]
    );

    if (!rows[0]) return res.status(404).json({ error: "User not found" });
    if (rows[0].role !== "admin")
      return res.status(403).json({ error: "Access denied" });

    next();
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ลบข้อมูลทั้งหมด (admin เท่านั้น)
export const deleteAllData = async (req: Request, res: Response) => {
  try {
    // ลบ claims ทั้งหมด
    await db.query("DELETE FROM claims");

    // ลบ prizes ทั้งหมด
    await db.query("DELETE FROM prizes");

    // ลบ purchases ทั้งหมด
    await db.query("DELETE FROM purchases");

    // ลบ lotto_tickets ทั้งหมด
    await db.query("DELETE FROM lotto_tickets");

    // ลบ draws ทั้งหมด
    await db.query("DELETE FROM draws");

    // ลบ users ที่เป็น member เท่านั้น
    await db.query("DELETE FROM users WHERE role = 'member'");

    res.json({ success: true, message: "ลบข้อมูลทั้งหมดสำหรับสมาชิกสำเร็จ" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
