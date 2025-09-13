import { Request, Response } from "express";
import { db } from "../config/db";

// ดึงเลขหวยทั้งหมด
export const getTickets = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT * FROM lotto_tickets");
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
