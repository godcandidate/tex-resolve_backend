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
exports.createZoomMeeting = void 0;
// zoom.utils.ts
const axios_1 = __importDefault(require("axios"));
const ErrorHandler_1 = __importDefault(require("./ErrorHandler"));
require("dotenv/config");
// Zoom credentials
const HOST_EMAIL = process.env.SMTP_MAIL;
const ZOOM_OAUTH_TOKEN_URL = "https://zoom.us/oauth/token";
const ZOOM_API_BASE_URL = "https://api.zoom.us/v2";
const CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;
const ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
let accessToken = null;
let tokenExpiry = 0;
// Fetch a new OAuth 2.0 access token
const fetchAccessToken = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if (!CLIENT_ID || !CLIENT_SECRET || !ACCOUNT_ID) {
            throw new ErrorHandler_1.default("Missing required Zoom credentials", 500);
        }
        const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
        const response = yield axios_1.default.post(ZOOM_OAUTH_TOKEN_URL, null, // No body for this POST request
        {
            params: {
                grant_type: "account_credentials",
                account_id: process.env.ZOOM_ACCOUNT_ID,
            },
            headers: {
                Authorization: `Basic ${authHeader}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        const { access_token, expires_in } = response.data;
        // Set token and expiry time
        accessToken = access_token;
        tokenExpiry = Date.now() + expires_in * 1000; // Convert seconds to milliseconds
    }
    catch (error) {
        console.error("Error fetching Zoom access token:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw new ErrorHandler_1.default("Failed to fetch Zoom access token", ((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) || 500);
    }
});
const ensureValidToken = () => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the access token is expired or not set
    if (!accessToken || Date.now() >= tokenExpiry) {
        yield fetchAccessToken(); // Refresh the token
    }
});
const createZoomMeeting = (topic, startTime) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ensureValidToken();
        const response = yield axios_1.default.post(`${ZOOM_API_BASE_URL}/users/${HOST_EMAIL}/meetings`, {
            topic,
            start_time: startTime,
            type: 2, // Scheduled meeting
            duration: 60, // 60 minutes
            timezone: "UTC",
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });
        return response.data.join_url;
    }
    catch (_error) {
        console.log(_error);
        throw new ErrorHandler_1.default("Failed to create Zoom meeting", 500);
    }
});
exports.createZoomMeeting = createZoomMeeting;
