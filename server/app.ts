import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import userRouter from "./routes/user.route";



const app = express();

//body parser
app.use(express.json({limit: "50mb"}));

//cookie parser
app.use(cookieParser());

//cors
app.use(cors({
  origin: process.env.ORIGIN
}));

// routes
app.use(
  "/api/v1",
  userRouter,
);

//testing api
app.use('/test', (req: Request, res:Response) => {
  res.status(200).json({
    success: true,
    message: "API is working"
  });
}); 

//unkown route
app.all("*", (req: Request, res:Response, next:NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});



export {app};
