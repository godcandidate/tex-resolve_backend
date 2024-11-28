import { app } from "./app";
import 'dotenv/config';


//create server
app.listen(process.env.PORT, () => {
  console.log(`Server is connected http://localhost:${process.env.PORT}`);
  //connectDB();
});