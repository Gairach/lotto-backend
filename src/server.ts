import express from "express";
import dotenv from "dotenv";
import * as os from "os";
import userRoutes from "./routes/userRoutes";
import ticketRoutes from "./routes/ticketRoutes";
import clearRoutes from "./routes/clearRoutes";
dotenv.config();

const app = express();
app.use(express.json());

app.use("/users", userRoutes);
app.use("/tickets", ticketRoutes);
app.use("/clear", clearRoutes);
// หา IP ของเครื่อง
const ip: string = (() => {
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
const port: number = Number(process.env.PORT) || 5000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Trip booking API listening at:`);
  console.log(`- Localhost: http://localhost:${port}`);
  console.log(`- Network IP: http://${ip}:${port}`);
});
