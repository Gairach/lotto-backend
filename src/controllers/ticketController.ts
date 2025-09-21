import { Request, Response } from "express";
import { db } from "../config/db";

// ดึงเลขหวยทั้งหมด (สำหรับดูข้อมูลตั๋วทั้งหมด)
export const getTickets = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT * FROM lotto_tickets");
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ฟังก์ชันสุ่มเลขหวย 6 หลัก จำนวน count (default 100)
function generateLottoNumbers(count: number = 100): string[] {
  const numbers = new Set<string>();
  while (numbers.size < count) {
    const num = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
    numbers.add(num);
  }
  return Array.from(numbers);
}

// ✅ 1. สร้างงวดใหม่ พร้อมสร้างตั๋วหวย 100 ตัว
export const createDraw = async (req: Request, res: Response) => {
  try {
    // สร้างงวดใหม่ (insert row ว่างใน draws)
    const [result]: any = await db.query("INSERT INTO draws () VALUES ()");
    const drawId = result.insertId;

    // สร้างเลขตั๋ว
    const tickets = generateLottoNumbers(100);
    const values = tickets.map(num => [num, drawId]);

    // บันทึกเลขตั๋วลง database
    await db.query(
      "INSERT INTO lotto_tickets (ticket_number, draw_id) VALUES ?",
      [values]
    );

    res.json({ message: "สร้างงวดใหม่สำเร็จ", drawId, tickets });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ 2. ดึง tickets เฉพาะที่ยัง available
export const getAvailableTickets = async (req: Request, res: Response) => {
  try {
    const drawId = req.params.drawId;
    const [rows] = await db.query(
      "SELECT * FROM lotto_tickets WHERE draw_id = ? AND status = 'available'",
      [drawId]
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ 3. ซื้อเลข (update ตั๋วเป็น sold และหักเงิน user)
export const buyTicket = async (req: Request, res: Response) => {
  try {
    const ticketId = req.params.ticketId;
    const { user_id } = req.body;

    // 1. ดึงราคาตั๋วและสถานะ
    const [[ticket]]: any = await db.query(
      "SELECT price, status FROM lotto_tickets WHERE ticket_id = ?",
      [ticketId]
    );
    if (!ticket) return res.status(404).json({ error: "ไม่พบเลขนี้" });
    if (ticket.status !== "available") {
      return res.status(400).json({ error: "เลขนี้ถูกขายไปแล้ว" });
    }

    // 2. ดึง wallet ของผู้ใช้
    const [[user]]: any = await db.query(
      "SELECT wallet FROM users WHERE user_id = ?",
      [user_id]
    );
    if (!user) return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    if (user.wallet < ticket.price) {
      return res.status(400).json({ error: "เงินไม่เพียงพอ" });
    }

    // 3. อัพเดตสถานะตั๋วเป็น sold
    await db.query(
      "UPDATE lotto_tickets SET status = 'sold' WHERE ticket_id = ?",
      [ticketId]
    );

    // 4. หักเงินจาก wallet
    await db.query(
      "UPDATE users SET wallet = wallet - ? WHERE user_id = ?",
      [ticket.price, user_id]
    );

    // 5. บันทึกการซื้อ
    await db.query(
      "INSERT INTO purchases (user_id, ticket_id, purchase_date) VALUES (?, ?, NOW())",
      [user_id, ticketId]
    );

    res.json({
      message: "ซื้อสำเร็จ",
      ticketId,
      user_id,
      price: ticket.price,
      remaining_wallet: user.wallet - ticket.price,
    });
  } catch (err: any) {
    console.error("buyTicket error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ 4. ปิดงวด + สุ่มรางวัล
export const closeDraw = async (req: Request, res: Response) => {
  try {
    const drawId = Number(req.params.drawId);
    if (isNaN(drawId)) return res.status(400).json({ error: "drawId ไม่ถูกต้อง" });

    // 1. อัพเดตสถานะงวดเป็น closed
    await db.query("UPDATE draws SET status = 'closed' WHERE draw_id = ?", [drawId]);

    // 2. ดึงเลขทั้งหมดของงวด
    const [tickets]: any = await db.query(
      "SELECT ticket_number FROM lotto_tickets WHERE draw_id = ?",
      [drawId]
    );
    if (tickets.length < 5) {
      return res.status(400).json({ error: "จำนวนเลขไม่เพียงพอสำหรับสุ่มรางวัล" });
    }

    // 3. สุ่มเลขรางวัล 5 ตัว
    const shuffled = tickets.map((t: any) => t.ticket_number).sort(() => Math.random() - 0.5);
    const firstPrize = shuffled[0];   // รางวะลที่ 1
    const secondPrize = shuffled[1]; // รางวะลที่ 2
    const thirdPrize = shuffled[2]; // รางวะลที่ 3
    const last3DigitsPrize = firstPrize.slice(-3); // รางวะลที่ 4 เลขท้าย 3 ตัว ดึงมาจากรางวัลที่ 1   -3 หมายถึงเอาแค่ 3 ตัวท้าย
    const last2DigitsPrize = firstPrize.slice(-2); // รางวะลที่ 5 เลขท้าย 2 ตัว ดึงมาจากรางวัลที่ 1   -2 หมายถึงเอาแค่ 2 ตัวท้าย

    // 4. กำหนดเงินรางวัลแต่ละประเภท
    const prizeData = [
      { type: "first", number: firstPrize, reward: 3000 },
      { type: "second", number: secondPrize, reward: 2000 },
      { type: "third", number: thirdPrize, reward: 1000 },
      { type: "last3", number: last3DigitsPrize, reward: 400 },
      { type: "last2", number: last2DigitsPrize, reward: 200 },
    ];

    // 5. บันทึกรางวัลลง table prizes
    for (const p of prizeData) {
      await db.query(
        "INSERT INTO prizes (draw_id, prize_type, winning_number, reward_amount) VALUES (?, ?, ?, ?)",
        [drawId, p.type, p.number, p.reward]
      );
    }

    res.json({
      message: "ปิดงวดเรียบร้อยและออกรางวัลแล้ว",
      drawId,
      results: prizeData,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ดึงรางวัลของผู้ใช้สำหรับงวดใดงวดหนึ่ง
export const getUserRewards = async (req: Request, res: Response) => {
  try {
    const drawId = Number(req.params.drawId);
    const userId = Number(req.params.userId);

    if (!drawId || !userId) {
      return res.status(400).json({ error: "กรุณาระบุ drawId และ userId" });
    }

    // ดึงสถานะงวด
    const [draw]: any = await db.query(
      "SELECT status FROM draws WHERE draw_id = ?",
      [drawId]
    );
    if (draw.length === 0) return res.status(404).json({ error: "ไม่พบนงวดนี้" });

    const drawStatus = draw[0].status; // active / closed

    // ดึง ticket ของผู้ใช้พร้อม purchase_id
    const [tickets]: any = await db.query(
      `SELECT t.ticket_number, t.ticket_id, p.purchase_id
       FROM lotto_tickets t
       JOIN purchases p ON t.ticket_id = p.ticket_id
       WHERE t.draw_id = ? AND p.user_id = ?`,
      [drawId, userId]
    );
    if (tickets.length === 0) return res.json({ drawStatus, rewards: [] });

    // ดึงรางวัลทั้งหมดของงวด
    const [prizes]: any = await db.query(
      "SELECT * FROM prizes WHERE draw_id = ?",
      [drawId]
    );

    // ดึงข้อมูลตั๋วที่เคยขึ้นรางวัลแล้ว
    const [claims]: any = await db.query(
      "SELECT purchase_id, prize_id FROM claims WHERE purchase_id IN (?)",
      [tickets.map((t: any) => t.purchase_id)]
    );

    // ตรวจสอบแต่ละ ticket ว่าถูกรางวัลหรือขึ้นรางวัลแล้ว
    const rewards = tickets.map((ticket: any) => {
      const prize = prizes.find((p: any) => p.winning_number === ticket.ticket_number);
      const claimed = prize
        ? claims.some((c: any) => c.purchase_id === ticket.purchase_id && c.prize_id === prize.prize_id)
        : false;

      return {
        purchase_id: ticket.purchase_id,
        ticket_number: ticket.ticket_number,
        status: drawStatus === "active" ? "pending" : prize ? "win" : "lose",
        prize: prize ? prize.reward_amount : 0,
        prize_type: prize ? prize.prize_type : null,
        already_claimed: claimed, // สำหรับ Flutter แสดงปุ่มขึ้นรางวัล
      };
    });

    res.json({ drawStatus, rewards });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// POST /tickets/claim - ผู้ใช้ขึ้นรางวัล
export const claimReward = async (req: Request, res: Response) => {
  try {
    const { purchaseId, userId } = req.body;
    if (!purchaseId || !userId) {
      return res.status(400).json({ error: "ต้องระบุ purchaseId และ userId" });
    }

    // ดึงข้อมูลตั๋ว + รางวัล
    const [rows]: any = await db.query(
      `SELECT p.purchase_id, p.user_id, t.ticket_number, r.prize_id, r.reward_amount, r.prize_type
       FROM purchases p
       JOIN lotto_tickets t ON p.ticket_id = t.ticket_id
       JOIN prizes r ON r.draw_id = t.draw_id AND r.winning_number = t.ticket_number
       WHERE p.purchase_id = ? AND p.user_id = ?`,
      [purchaseId, userId]
    );
    // JOIN lotto_tickets t ON p.ticket_id = t.ticket_id เอาเลขหวยและงวดที่ซื้อมาต่อกับแต่ละการซื้อ
    // JOIN prizes r ON r.draw_id = t.draw_id AND r.winning_number = t.ticket_number ต่อรางวัลเข้ากับเลขหวยของผู้ใช้ เฉพาะถ้าเลขนั้นถูกรางวัล

    if (rows.length === 0) return res.status(400).json({ error: "ไม่พบข้อมูลรางวัลที่ถูกรางวัล" });

    const prize = rows[0];

    // ตรวจสอบว่าขึ้นรางวัลไปแล้วหรือยัง
    const [checkClaim]: any = await db.query(
      "SELECT * FROM claims WHERE purchase_id = ? AND prize_id = ?",
      [purchaseId, prize.prize_id]
    );
    if (checkClaim.length > 0) return res.status(400).json({ error: "ตั๋วนี้ขึ้นรางวัลไปแล้ว" });

    // Insert ข้อมูลการขึ้นรางวัล
    await db.query(
      `INSERT INTO claims (purchase_id, prize_id, claim_date, amount) 
       VALUES (?, ?, NOW(), ?)`,
      [purchaseId, prize.prize_id, prize.reward_amount]
    );

    // อัพเดต wallet ของผู้ใช้
    await db.query(
      `UPDATE users SET wallet = wallet + ? WHERE user_id = ?`,
      [prize.reward_amount, userId]
    );

    res.json({
      message: "ขึ้นรางวัลสำเร็จและอัพเดตยอดเงินแล้ว",
      amount: prize.reward_amount,
      prize_type: prize.prize_type,
      ticket_number: prize.ticket_number,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /tickets/history/:userId - ประวัติการซื้อของผู้ใช้
export const getUserPurchaseHistory = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    if (!userId) return res.status(400).json({ error: "กรุณาระบุ userId" });

    // ดึงประวัติการซื้อทั้งหมด พร้อมรางวัลและสถานะการขึ้นรางวัล
    const [rows]: any = await db.query(
      `SELECT 
         p.purchase_id,
         t.ticket_number,
         t.price,
         d.draw_id,
         d.status AS draw_status,
         r.prize_type,
         IFNULL(r.reward_amount, 0) AS reward_amount,
         c.claim_date
       FROM purchases p
       JOIN lotto_tickets t ON p.ticket_id = t.ticket_id 
       JOIN draws d ON t.draw_id = d.draw_id
       LEFT JOIN prizes r ON r.draw_id = d.draw_id AND r.winning_number = t.ticket_number
       LEFT JOIN claims c ON c.purchase_id = p.purchase_id AND c.prize_id = r.prize_id
       WHERE p.user_id = ?
       ORDER BY p.purchase_date DESC`,
      [userId]
    );
    // JOIN lotto_tickets t ON p.ticket_id = t.ticket_id เอาข้อมูลเลขหวยและราคามาต่อกับแต่ละการซื้อ
    // JOIN draws d ON t.draw_id = d.draw_id เอาสถานะงวด (active/closed) มาแสดง
    // LEFT JOIN prizes r ON r.draw_id = d.draw_id AND r.winning_number = t.ticket_number ต่อรางวัล (ถ้ามี) กับเลขหวยของผู้ใช้
    //LEFT JOIN claims c ON c.purchase_id = p.purchase_id AND c.prize_id = r.prize_id ต่อข้อมูลว่าผู้ใช้ขึ้นรางวัลแล้วหรือยัง (claim_date)
    // map ข้อมูลให้เข้าใจง่าย

    const history = rows.map((row: any) => ({
      purchase_id: row.purchase_id,
      ticket_number: row.ticket_number?.toString() || "ไม่พบเลขหวย",
      price: Number(row.price) || 0,
      draw_id: row.draw_id,
      draw_status: row.draw_status || "active",
      prize_type: row.prize_type || "ยังไม่ได้รางวัล",
      reward_amount: Number(row.reward_amount) || 0,
      claimed_at: row.claim_date || null,
    }));

    res.json({ success: true, history });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
