import { Router } from "express";
import { deleteAllData } from "../controllers/cleardataControlle";

const router = Router();
router.delete("/admin", deleteAllData);

export default router;