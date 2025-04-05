import express from "express";
import { isAuthenticated } from "../utils/auth";
import { createMeeting, getUserMeetings } from "../controllers/meeting.controller";

const meetingRouter = express.Router();

meetingRouter.post("/meetings", isAuthenticated, createMeeting);
meetingRouter.get("/meetings/me", isAuthenticated, getUserMeetings);

export default meetingRouter;
