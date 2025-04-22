import { Request, Response, NextFunction } from "express";
import ticketModel, { ITicket } from "../models/ticket.model";
import { redis } from "../utils/redis";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middlewares/catchAsyncError";
import { deleteAttachments, uploadAttachments } from "./asset.controller";

//using interface for req.user
declare module "express" {
  interface Request {
    ticket?: ITicket;
  }
}

//Create ticket interface
interface ICreateTicketBody {
  title: string;
  category: string;
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
        category: req.body.category,
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
        message: "Ticket created successfully",
      });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


// Get all tickets with pagination and search
export const getAllTickets = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {

      // Extract query parameters for pagination and search
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10; 
      const searchQuery = req.query.search?.toString().trim() || ""; 
      const tags = Array.isArray(req.query.tags)
        ? (req.query.tags as string[])
        : [req.query.tags?.toString() || ""]; 

      // Check if tickets are in Redis cache
      //const cacheKey = `tickets_page_${page}_limit_${limit}_search_${searchQuery}_tags_${tags.join(",")}`;
      const isCacheExist = false; 
      if (isCacheExist) {
        const cachedTickets = JSON.parse(isCacheExist);
        return res.status(200).json({
          success: true,
          tickets: cachedTickets.tickets,
          totalPages: cachedTickets.totalPages,
          currentPage: cachedTickets.currentPage,
        });
      }

      // Build the query based on search and tags
      const query: any = {};
      if (searchQuery) {
        query.$or = [
          { title: { $regex: searchQuery, $options: "i" } }, // Case-insensitive search by title
          { tags: { $in: [searchQuery] } }, // Search by tag
          { category: { $regex: searchQuery, $options: "i" } }, // Case-insensitive search by category
        ];
      }
      if (tags.length > 0 && tags[0] !== "") {
        query.tags = { $all: tags }; // Match all provided tags
      }

      // Calculate pagination parameters
      const skip = (page - 1) * limit;

      // Fetch total count of tickets matching the query
      const totalTickets = await ticketModel.countDocuments(query);

      // Fetch paginated tickets, excluding attachments
      const tickets = await ticketModel
        .find(query)
        .select("-attachments")
        .skip(skip)
        .limit(limit);

      // Prepare response data
      const response = {
        tickets,
        totalPages: Math.ceil(totalTickets / limit),
        currentPage: page,
      };

      // Optionally, cache the result in Redis
      // await redis.set(cacheKey, JSON.stringify(response), "EX", 60 * 5); // Cache for 5 minutes

      // Respond with the paginated tickets
      return res.status(200).json(response);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);


//Get all details of a ticket
export const getTicket = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
  try {

     //Get ticket from database
    const ticket_id = req.params.id;
    const ticket = await ticketModel.findById(ticket_id);
   

    res.status(200).json(ticket);

  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

//get all tickets by a user
export const getUserTickets = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {

      //Get user id 
      const issuedById =  req.user?._id as string;

      // Query tickets where issuedBy.id matches the provided ID
      const tickets = await ticketModel.find({
        "issuedBy.id": issuedById,
      }).select("-attachments"); 

      // Respond with the filtered tickets
      return res.status(200).json({
        tickets
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//Create ticket interface
interface IUpdateTicketBody {
  title?: string;
  description?: string;
  attempted_solution?: string;
  attachments?: Array<{ public_id: string; url: string }>;
  tags?: string[]; // Array of strings
  issuedBy: {
    id?: string;
    name?: string;
    role?: string;
    profile?: string;
  };
}
// update a ticket details given the id
export const updateTicket = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {

      //Get updated ticket body
      const ticketData:IUpdateTicketBody = req.body;
      const userId = ticketData.issuedBy.id;

      //Check if user owns this ticket
      const issuedById =  req.user?._id as string;
      if (userId !== issuedById){
        res.status(400).json({
          message: "user not authorized"});
      }
      
      const ticketId = req.params.id;

      await ticketModel.findByIdAndUpdate(
        ticketId,
        { $set: ticketData },
        { new: true }
      );

      res.status(200).json({ message: "ticket details updated successfully"});
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Delete ticket and its attachments
export const deleteTicket = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ticketId = req.params.id;

      // Fetch the ticket from the database
      const ticket = await ticketModel.findById(ticketId).select("attachments");

      if (!ticket) {
        return next(new ErrorHandler("Ticket not found", 404));
      }

      // Extract file paths from the attachments
      const filePaths = ticket.attachments?.map((attachment) =>
        `attachments/${attachment.public_id}`
      );

      // Delete the attachments from Firebase Storage if they exist
      if (filePaths && filePaths.length > 0) {
        const deletionResult = await deleteAttachments(filePaths);

        if (!deletionResult) {
          console.warn("Some attachments could not be deleted.");
        }
      }

      // Delete the ticket from the database
      await ticketModel.findByIdAndDelete(ticketId);

      return res.status(200).json({
        message: "Ticket and its attachments deleted successfully",
      });
    } catch (error: any) {
      console.error(error);
      return next(new ErrorHandler(error.message, 500));
    }
  }
);