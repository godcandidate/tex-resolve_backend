"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
require("dotenv/config");
const user_route_1 = __importDefault(require("./routes/user.route"));
const ticket_route_1 = __importDefault(require("./routes/ticket.route"));
const meeting_route_1 = __importDefault(require("./routes/meeting.route"));
const app = (0, express_1.default)();
exports.app = app;
//body parser
app.use(express_1.default.json({ limit: "50mb" }));
//cookie parser
app.use((0, cookie_parser_1.default)());
//cors
app.use((0, cors_1.default)({
    origin: process.env.ORIGIN,
}));
// routes
app.use("/api/v1", user_route_1.default, ticket_route_1.default, meeting_route_1.default);
//testing api
app.use("/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API is working",
    });
});
//Simple welcome page
app.use("/", (req, res) => {
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
app.all("*", (req, res, next) => {
    const err = new Error(`Route ${req.originalUrl} not found`);
    err.statusCode = 404;
    next(err);
});
