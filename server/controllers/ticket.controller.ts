import { Request, Response, NextFunction } from "express";
import ticketModel, { ITicket } from "../models/ticket.model";
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
  issuedBy: string;
}

//Create ticket
export const createTicket = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if attachments are added
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
        issuedBy: req.body.issuedBy,
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
