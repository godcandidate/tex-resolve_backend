import express from "express";
import { createTicket, deleteTicket, getAllTickets, getTicket, getUserTickets, updateTicket } from "../controllers/ticket.controller";
import { isAuthenticated } from "../utils/auth";
import multer from "multer";

const ticketRouter = express.Router();


// Configure multer to store files in memory
const upload = multer({
    storage: multer.memoryStorage(), // Store files in memory
  });

ticketRouter.post("/tickets", isAuthenticated,  upload.array("attachments", 10), createTicket);
ticketRouter.get("/tickets", getAllTickets);
ticketRouter.get("/user/tickets", isAuthenticated, getUserTickets);
ticketRouter.get("/tickets/:id", getTicket);
ticketRouter.put("/tickets/:id", isAuthenticated, updateTicket);
ticketRouter.delete("/tickets/:id", isAuthenticated, deleteTicket);




export default ticketRouter;