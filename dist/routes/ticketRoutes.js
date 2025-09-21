"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ticketController_1 = require("../controllers/ticketController");
const router = (0, express_1.Router)();
router.get("/", ticketController_1.getTickets);
router.post("/draws", ticketController_1.createDraw);
router.get("/draws/:drawId/tickets", ticketController_1.getAvailableTickets);
router.post("/buy/:ticketId", ticketController_1.buyTicket);
router.post("/draws/:drawId/close", ticketController_1.closeDraw);
router.get("/reward/:drawId/:userId", ticketController_1.getUserRewards);
router.get("/history/:userId", ticketController_1.getUserPurchaseHistory);
router.post("/claim", ticketController_1.claimReward);
exports.default = router;
//# sourceMappingURL=ticketRoutes.js.map