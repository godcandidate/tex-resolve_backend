import { Request, Response } from "express";
import meetingModel from "../models/meeting.model";
import { createZoomMeeting } from "../utils/zoom";
import ErrorHandler from "../utils/ErrorHandler";

// Define the interface for the request body
interface IMeetingRequestBody {
  title: string;
  ticket: string;
  date: string;
  time: string;
}

export const createMeeting = async (
  req: Request<{}, {}, IMeetingRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { title, ticket, date, time } = req.body as IMeetingRequestBody;

    // Authenticate the user and get their email
    if (!req.user) {
      throw new ErrorHandler("User not authenticated", 401);
    }
    const user = req.user;
    const hostEmail = user.email;

    // Validate input
    if (!title || !ticket || !date || !time) {
      throw new ErrorHandler("All fields are required", 400);
    }

    // Combine date and time into ISO format for Zoom API
    const startTime = new Date(`${date}T${time}:00`);

    // Check if the scheduled time is in the past
    const currentTime = new Date();
    if (startTime <= currentTime) {
      throw new ErrorHandler(
        "Meeting cannot be scheduled for a past time",
        400
      );
    }

    // Create Zoom meeting
    const zoomMeetingUrl = await createZoomMeeting(
      title,
      startTime.toISOString()
    );

    // Save meeting to the database
    await meetingModel.create({
      title,
      host_email: hostEmail,
      ticket,
      date,
      time,
      meeting_link: zoomMeetingUrl,
    });

    res.status(201).json({
      message: "Meeting created successfully",
      link: zoomMeetingUrl,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
