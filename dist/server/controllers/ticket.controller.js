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
exports.deleteTicket = exports.getTicket = exports.getAllTickets = exports.createTicket = void 0;
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
            success: true,
            message: "Ticket created successfully",
        });
    }
    catch (error) {
        console.log(error);
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
//Get all tickets
exports.getAllTickets = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //check if tickets is in redis cache
        //const isCacheExist = await redis.get("allTickets");
        const isCacheExist = false;
        if (isCacheExist) {
            const tickets = JSON.parse(isCacheExist);
            res.status(200).json({
                tickets
            });
        }
        else {
            // exclude attachments attributes
            const tickets = yield ticket_model_1.default.find().select("-attachments");
            //await redis.set("allTickets", JSON.stringify(tickets));
            res.status(200).json({
                tickets
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
//Get all details of a ticket
exports.getTicket = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //Get a todo from database
        const ticket_id = req.params.id;
        const ticket = yield ticket_model_1.default.findById(ticket_id);
        res.status(200).json(ticket);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
// Delete ticket and associated attachments
exports.deleteTicket = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const ticket_id = req.params.id;
        const ticket = yield ticket_model_1.default.findById(ticket_id);
        if (!ticket) {
            return next(new ErrorHandler_1.default("Ticket not found", 404));
        }
        // Extract file paths from ticket attachments
        const filePaths = ((_a = ticket.attachments) === null || _a === void 0 ? void 0 : _a.map(att => `attachments/${att.public_id}`)) || [];
        const deleteResult = yield (0, asset_controller_1.deleteAttachments)(filePaths);
        if (!deleteResult.success) {
            return next(new ErrorHandler_1.default(deleteResult.error || "Failed to delete attachments", 500));
        }
        // Delete the ticket from the database
        yield ticket_model_1.default.findByIdAndDelete(ticket_id);
        res.status(200).json({ success: true, message: "Ticket deleted successfully" });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
