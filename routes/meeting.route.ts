import express from "express";
import { isAuthenticated } from "../utils/auth";
import { createMeeting } from "../controllers/meeting.controller";

const meetingRouter = express.Router();

meetingRouter.post("/meetings", isAuthenticated, createMeeting);

export default meetingRouter;
