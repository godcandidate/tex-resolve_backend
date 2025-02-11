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
const app = (0, express_1.default)();
exports.app = app;
//body parser
app.use(express_1.default.json({ limit: "50mb" }));
//cookie parser
app.use((0, cookie_parser_1.default)());
//cors
app.use((0, cors_1.default)({
    origin: process.env.ORIGIN
}));
// routes
app.use("/api/v1", user_route_1.default, ticket_route_1.default);
//testing api
app.use('/test', (req, res) => {
    res.status(200).json({
        success: true,
        message: "API is working"
    });
});
//unkown route
app.all("*", (req, res, next) => {
    const err = new Error(`Route ${req.originalUrl} not found`);
    err.statusCode = 404;
    next(err);
});
