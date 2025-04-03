import mongoose, { Document, Model, Schema } from "mongoose";

import "dotenv/config";

export interface IMeeting extends Document {
  title: string;
  host_email: string;
  ticket: string;
  date: string;
  time: string;
  meeting_link: string;
  resolver: string;
}

//User Schema
const meetingSchema: Schema<IMeeting> = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Enter title"],
    },
    host_email: {
      type: String,
      required: [true, "Enter host email"],
    },
    ticket: {
      type: String,
      required: [true, "Enter ticket"],
    },
    date: {
      type: String,
      required: [true, "Enter date"],
    },
    time: {
      type: String,
      required: [true, "Enter time"],
    },
    meeting_link: {
      type: String,
      required: [true, "Enter meeting link"],
    },
    resolver: {
      type: String,
    },
  },
  { timestamps: true }
);

const meetingModel: Model<IMeeting> = mongoose.model("Meeting", meetingSchema);
export default meetingModel;
