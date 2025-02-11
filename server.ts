import { app } from "./app";
import "dotenv/config";
import connectDB from "./utils/db";

//create server
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is connected http://localhost:${process.env.PORT}`);
  connectDB();
});
