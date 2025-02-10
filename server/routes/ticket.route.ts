import express from "express";
import { createTicket, getAllTickets, getTicket, getUserTickets, updateTicket } from "../controllers/ticket.controller";
import { isAuthenticated } from "../utils/auth";
import multer from "multer";

const ticketRouter = express.Router();


// Configure multer to store files in memory
const upload = multer({
    storage: multer.memoryStorage(), // Store files in memory
    limits: {
      fileSize: 50 * 1024 * 1024, // Limit file size to 50 MB
    },
  });

ticketRouter.post("/tickets", isAuthenticated,  upload.array("attachments", 10), createTicket);
ticketRouter.get("/tickets", getAllTickets);
ticketRouter.get("/tickets/:id", getTicket);
ticketRouter.get("/user/tickets", isAuthenticated, getUserTickets);
ticketRouter.put("/tickets/:id", isAuthenticated, updateTicket);




export default ticketRouter;