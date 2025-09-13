import { Request, Response } from "express";
import { db } from "../config/db";

export const Login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบ" });
  }

  try {
    // ดึงผู้ใช้จากฐานข้อมูล
    const [rows]: any = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    }

    const user = rows[0];

    // ตรวจสอบรหัสผ่าน
    if (user.password !== password) {
      return res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง" });
    }

    // Login สำเร็จ
    return res.status(200).json({
      message: "Login สำเร็จ",
      user: {
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        wallet: user.wallet,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "เกิดข้อผิดพลาดจากระบบ" });
  }
};
