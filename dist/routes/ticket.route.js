"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ticket_controller_1 = require("../controllers/ticket.controller");
const auth_1 = require("../utils/auth");
const multer_1 = __importDefault(require("multer"));
const ticketRouter = express_1.default.Router();
// Configure multer to store files in memory
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(), // Store files in memory
});
ticketRouter.post("/tickets", auth_1.isAuthenticated, upload.array("attachments", 10), ticket_controller_1.createTicket);
ticketRouter.get("/tickets", ticket_controller_1.getAllTickets);
ticketRouter.get("/tickets/me", auth_1.isAuthenticated, ticket_controller_1.getUserTickets);
ticketRouter.get("/tickets/:id", ticket_controller_1.getTicket);
ticketRouter.put("/tickets/:id", auth_1.isAuthenticated, ticket_controller_1.updateTicket);
ticketRouter.delete("/tickets/:id", auth_1.isAuthenticated, ticket_controller_1.deleteTicket);
exports.default = ticketRouter;
