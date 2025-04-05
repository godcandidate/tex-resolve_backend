"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
//User Schema
const meetingSchema = new mongoose_1.default.Schema({
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
}, { timestamps: true });
const meetingModel = mongoose_1.default.model("Meeting", meetingSchema);
exports.default = meetingModel;
