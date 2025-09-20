import { Router } from "express";
import { buyTicket, claimReward, closeDraw, createDraw, getAvailableTickets, getTickets, getUserPurchaseHistory, getUserRewards } from "../controllers/ticketController";

const router = Router();

router.get("/", getTickets);
router.post("/draws", createDraw);
router.get("/draws/:drawId/tickets", getAvailableTickets);
router.post("/buy/:ticketId", buyTicket);
router.post("/draws/:drawId/close", closeDraw);

router.get("/reward/:drawId/:userId", getUserRewards);
router.get("/history/:userId", getUserPurchaseHistory);

router.post("/claim", claimReward);

export default router;