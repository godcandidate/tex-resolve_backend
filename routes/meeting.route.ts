import express from "express";
import { isAuthenticated } from "../utils/auth";
import { createMeeting, getTicketMeeting, getUserMeetings, updateMeetingResolver } from "../controllers/meeting.controller";

const meetingRouter = express.Router();

meetingRouter.post("/meetings", isAuthenticated, createMeeting);
meetingRouter.get("/meetings/me", isAuthenticated, getUserMeetings);
meetingRouter.patch("/meetings/:id", isAuthenticated, updateMeetingResolver);
meetingRouter.get("/meetings/ticket/:id", isAuthenticated, getTicketMeeting);
export default meetingRouter;
