import { app } from "./app";
import 'dotenv/config';
import connectDB from "./utils/db";


//create server 
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is connected http://localhost:${process.env.PORT}`);
  connectDB();
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