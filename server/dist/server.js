"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
require("dotenv/config");
const db_1 = __importDefault(require("./utils/db"));
//create server 
const PORT = process.env.PORT || 4000;
app_1.app.listen(PORT, () => {
    console.log(`Server is connected http://localhost:${process.env.PORT}`);
    (0, db_1.default)();
});
// Memory Usage Monitoring
setInterval(() => {
    const memoryUsage = process.memoryUsage();
    console.log(`
    🧠 Memory Usage:
    🟢 RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB
    🔵 Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB
    🔴 Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB
    🟡 External: ${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB
  `);
}, 5000); // Logs every 5 seconds
