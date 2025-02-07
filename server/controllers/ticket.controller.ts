import { Request, Response, NextFunction } from "express";
import ticketModel, { ITicket } from "../models/ticket.model";
import { redis } from "../utils/redis";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middlewares/catchAsyncError";
import { uploadAttachments } from "./asset.controller";

//using interface for req.user
declare module "express" {
  interface Request {
    ticket?: ITicket;
  }
}

//Create ticket interface
interface ICreateTicketBody {
  title: string;
  description: string;
  attempted_solution: string;
  attachments?: Array<{ public_id: string; url: string }>;
  tags?: string[]; // Array of strings
  issuedBy: {
    id: string;
    name: string;
    role?: string;
    profile?: string;
  };
}

//Create ticket
export const createTicket = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {

      // get user details
      const issuedBy = {
        id: req.user?._id as string,
        name: req.user?.name as string,

      };

      //Check if attachments are added
      let attachments: Array<{ public_id: string; url: string }> | undefined;
      const files = req.files || (req.file ? [req.file] : []);
      if (files.length !== 0) {
        const uploadResult = await uploadAttachments(req);

        // Check if there was an error during file upload
        if (!uploadResult.success) {
          return next(
            new ErrorHandler(
              uploadResult.error || "Failed to upload attachments",
              400
            )
          );
        }

        attachments = uploadResult.data;
      }

      // Extract ticket data from the request body
      const ticketData: ICreateTicketBody = {
        title: req.body.title,
        description: req.body.description,
        attempted_solution: req.body.attempted_solution,
        tags: req.body.tags || [],
        issuedBy,
      };

      // Add attachments to the ticket data if they exist
      if (attachments && attachments.length > 0) {
        ticketData.attachments = attachments;
      }

      // Store the ticket
      await ticketModel.create(ticketData);

      // Respond with the created ticket
      return res.status(201).json({
        success: true,
        message: "Ticket created successfully",
      });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


//Get all tickets
export const getAllTickets = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //check if tickets is in redis cache
      //const isCacheExist = await redis.get("allTickets");
      const isCacheExist = false;

      if (isCacheExist) {
        const tickets = JSON.parse(isCacheExist);
        res.status(200).json({
          tickets
        });
      } else {
        // exclude attachments attributes
        const tickets = await ticketModel.find().select(
          "-attachments"
        );
        //await redis.set("allTickets", JSON.stringify(tickets));

        res.status(200).json({
          tickets
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


//Get all details of a ticket
export const getTicket = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
  try {

     //Get a todo from database
    const ticket_id = req.params.id;
    const ticket = await ticketModel.findById(ticket_id);
   

    res.status(200).json(ticket);

  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});