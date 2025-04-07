import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import userRouter from "./routes/user.route";
import ticketRouter from "./routes/ticket.route";
import meetingRouter from "./routes/meeting.route";

const app = express();

//body parser
app.use(express.json({ limit: "50mb" }));

//cookie parser
app.use(cookieParser());

//cors
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// routes
app.use("/api/v1", userRouter, ticketRouter, meetingRouter);

//testing api
app.use("/test", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

//Simple welcome page
app.use("/", (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TexResolve API</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 50px;
          background-color: #f4f4f4;
        }
        h1 {
          color: #333;
        }
        p {
          font-size: 18px;
          color: #555;
        }
        a {
          display: inline-block;
          margin-top: 20px;
          padding: 10px 20px;
          font-size: 18px;
          text-decoration: none;
          color: white;
          background-color: #007bff;
          border-radius: 5px;
        }
        a:hover {
          background-color: #0056b3;
        }
      </style>
    </head>
    <body>
      <h1>Welcome to TexResolve API</h1>
      <p>Explore the API documentation to integrate and use TexResolve effectively.</p>
      <a href="https://backend-api-docs.onrender.com/" target="_blank">View API Documentation</a>
    </body>
    </html>
  `);
});

//unkown route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

export { app };
