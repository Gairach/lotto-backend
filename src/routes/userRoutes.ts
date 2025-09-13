import { Router } from "express";
import { getUsers, addUser } from "../controllers/userController"; // path ถูกต้อง
import { Login } from "../controllers/loginController";

const router = Router();

router.get("/", getUsers);   // GET /api/users
router.post("/", addUser);   // POST /api/users
router.post("/login", Login); // POST /api/users/login

export default router;
