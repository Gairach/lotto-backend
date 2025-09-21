"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cleardataControlle_1 = require("../controllers/cleardataControlle");
const router = (0, express_1.Router)();
router.delete("/admin", cleardataControlle_1.deleteAllData);
exports.default = router;
//# sourceMappingURL=clearRoutes.js.map