"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../utils/auth");
const meeting_controller_1 = require("../controllers/meeting.controller");
const meetingRouter = express_1.default.Router();
meetingRouter.post("/meetings", auth_1.isAuthenticated, meeting_controller_1.createMeeting);
meetingRouter.get("/meetings/me", auth_1.isAuthenticated, meeting_controller_1.getUserMeetings);
meetingRouter.patch("/meetings/:id", auth_1.isAuthenticated, meeting_controller_1.updateMeetingResolver);
meetingRouter.get("/meetings/ticket/:id", auth_1.isAuthenticated, meeting_controller_1.getTicketMeeting);
exports.default = meetingRouter;
