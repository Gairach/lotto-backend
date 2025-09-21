"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController"); // path ถูกต้อง
const loginController_1 = require("../controllers/loginController");
const router = (0, express_1.Router)();
router.get("/", userController_1.getUsers); // GET /api/users
router.post("/", userController_1.addUser); // POST /api/users
router.post("/login", loginController_1.Login); // POST /api/users/login
router.get("/:id", userController_1.getUserById);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map