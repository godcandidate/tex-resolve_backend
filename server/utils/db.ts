import mongoose from "mongoose";
import 'dotenv/config';

const dbUrl: string = process.env.DB_URI || '';

const connectDB = async () => {
    try {
        await mongoose.connect(dbUrl, {
            maxPoolSize: 10,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        });
        console.log(`Database connected with ${mongoose.connection.host}`);
        
        // Handle connection errors
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        // Handle disconnection
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            setTimeout(connectDB, 5000);
        });

    } catch (error: any) {
        console.log(error);
        setTimeout(() => {
            connectDB().catch(console.error);
        }, 5000).unref();
    }
};

export default connectDB;