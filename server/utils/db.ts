import mongoose from "mongoose";
import 'dotenv/config';


const dbUrl: string = process.env.DB_URI || '';

//connect database
const connectDB = async () => {
    try {
         await mongoose.connect(dbUrl).then((data:any) => {
            console.log(`Database connected with ${data.connection.host}`);
         });
    } catch (error: any) {
        console.log(error);
        setTimeout(connectDB, 5000).unref();;
    }
};

export default connectDB;