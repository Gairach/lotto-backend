"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const os = __importStar(require("os"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const ticketRoutes_1 = __importDefault(require("./routes/ticketRoutes"));
const clearRoutes_1 = __importDefault(require("./routes/clearRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/users", userRoutes_1.default);
app.use("/tickets", ticketRoutes_1.default);
app.use("/clear", clearRoutes_1.default);
// หา IP ของเครื่อง
const ip = (() => {
    let address = "0.0.0.0";
    const interfaces = os.networkInterfaces();
    Object.keys(interfaces).forEach((interfaceName) => {
        interfaces[interfaceName]?.forEach((interfaceInfo) => {
            if (interfaceInfo.family === "IPv4" && !interfaceInfo.internal) {
                address = interfaceInfo.address;
            }
        });
    });
    return address;
})();
// Port
const port = Number(process.env.PORT) || 5000;
app.listen(port, "0.0.0.0", () => {
    console.log(`Trip booking API listening at:`);
    console.log(`- Localhost: http://localhost:${port}`);
    console.log(`- Network IP: http://${ip}:${port}`);
});
//# sourceMappingURL=server.js.map