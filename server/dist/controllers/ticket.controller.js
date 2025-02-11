"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTicket = exports.updateTicket = exports.getUserTickets = exports.getTicket = exports.getAllTickets = exports.createTicket = void 0;
const ticket_model_1 = __importDefault(require("../models/ticket.model"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const catchAsyncError_1 = require("../middlewares/catchAsyncError");
const asset_controller_1 = require("./asset.controller");
//Create ticket
exports.createTicket = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // get user details
        const issuedBy = {
            id: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            name: (_b = req.user) === null || _b === void 0 ? void 0 : _b.name,
        };
        //Check if attachments are added
        let attachments;
        const files = req.files || (req.file ? [req.file] : []);
        if (files.length !== 0) {
            const uploadResult = yield (0, asset_controller_1.uploadAttachments)(req);
            // Check if there was an error during file upload
            if (!uploadResult.success) {
                return next(new ErrorHandler_1.default(uploadResult.error || "Failed to upload attachments", 400));
            }
            attachments = uploadResult.data;
        }
        // Extract ticket data from the request body
        const ticketData = {
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
        yield ticket_model_1.default.create(ticketData);
        // Respond with the created ticket
        return res.status(201).json({
            message: "Ticket created successfully",
        });
    }
    catch (error) {
        console.log(error);
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
// Get all tickets with pagination and search
exports.getAllTickets = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Extract query parameters for pagination and search
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchQuery = ((_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString().trim()) || "";
        const tags = Array.isArray(req.query.tags)
            ? req.query.tags
            : [((_b = req.query.tags) === null || _b === void 0 ? void 0 : _b.toString()) || ""];
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
        const query = {};
        if (searchQuery) {
            query.$or = [
                { title: { $regex: searchQuery, $options: "i" } }, // Case-insensitive search by title
                { tags: { $in: [searchQuery] } }, // Search by tag
            ];
        }
        if (tags.length > 0 && tags[0] !== "") {
            query.tags = { $all: tags }; // Match all provided tags
        }
        // Calculate pagination parameters
        const skip = (page - 1) * limit;
        // Fetch total count of tickets matching the query
        const totalTickets = yield ticket_model_1.default.countDocuments(query);
        // Fetch paginated tickets, excluding attachments
        const tickets = yield ticket_model_1.default
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
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
//Get all details of a ticket
exports.getTicket = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //Get ticket from database
        const ticket_id = req.params.id;
        const ticket = yield ticket_model_1.default.findById(ticket_id);
        res.status(200).json(ticket);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
//get all tickets by a user
exports.getUserTickets = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        //Get user id 
        const issuedById = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        // Query tickets where issuedBy.id matches the provided ID
        const tickets = yield ticket_model_1.default.find({
            "issuedBy.id": issuedById,
        }).select("-attachments");
        // Respond with the filtered tickets
        return res.status(200).json({
            tickets
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
// update a ticket details given the id
exports.updateTicket = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        //Get updated ticket body
        const ticketData = req.body;
        const userId = ticketData.issuedBy.id;
        //Check if user owns this ticket
        const issuedById = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (userId !== issuedById) {
            res.status(400).json({
                message: "user not authorized"
            });
        }
        const ticketId = req.params.id;
        yield ticket_model_1.default.findByIdAndUpdate(ticketId, { $set: ticketData }, { new: true });
        res.status(200).json({ message: "ticket details updated successfully" });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
// Delete ticket and its attachments
exports.deleteTicket = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const ticketId = req.params.id;
        // Fetch the ticket from the database
        const ticket = yield ticket_model_1.default.findById(ticketId).select("attachments");
        if (!ticket) {
            return next(new ErrorHandler_1.default("Ticket not found", 404));
        }
        // Extract file paths from the attachments
        const filePaths = (_a = ticket.attachments) === null || _a === void 0 ? void 0 : _a.map((attachment) => `attachments/${attachment.public_id}`);
        // Delete the attachments from Firebase Storage if they exist
        if (filePaths && filePaths.length > 0) {
            const deletionResult = yield (0, asset_controller_1.deleteAttachments)(filePaths);
            if (!deletionResult) {
                console.warn("Some attachments could not be deleted.");
            }
        }
        // Delete the ticket from the database
        yield ticket_model_1.default.findByIdAndDelete(ticketId);
        return res.status(200).json({
            message: "Ticket and its attachments deleted successfully",
        });
    }
    catch (error) {
        console.error(error);
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
