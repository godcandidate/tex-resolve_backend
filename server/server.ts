import { app } from "./app";
import 'dotenv/config';
import connectDB from "./utils/db";


//create server 
app.listen(process.env.PORT, () => {
  console.log(`Server is connected http://localhost:${process.env.PORT}`);
  connectDB();
});