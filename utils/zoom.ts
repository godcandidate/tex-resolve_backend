// zoom.utils.ts
import axios from "axios";
import ErrorHandler from "./ErrorHandler";

import "dotenv/config";

// Zoom credentials
const HOST_EMAIL = process.env.SMTP_MAIL;
const ZOOM_OAUTH_TOKEN_URL = "https://zoom.us/oauth/token";
const ZOOM_API_BASE_URL = "https://api.zoom.us/v2";
const CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;
const ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;

let accessToken: string | null = null;
let tokenExpiry: number = 0;

interface ZoomTokenResponse {
  access_token: string;
  expires_in: number;
}

// Fetch a new OAuth 2.0 access token
const fetchAccessToken = async () => {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET || !ACCOUNT_ID) {
      throw new ErrorHandler("Missing required Zoom credentials", 500);
    }

    const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
      "base64"
    );

    const response = await axios.post<ZoomTokenResponse>(
      ZOOM_OAUTH_TOKEN_URL,
      null, // No body for this POST request
      {
        params: {
          grant_type: "account_credentials",
          account_id: process.env.ZOOM_ACCOUNT_ID,
        },
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, expires_in } = response.data;

    // Set token and expiry time
    accessToken = access_token;
    tokenExpiry = Date.now() + expires_in * 1000; // Convert seconds to milliseconds
  } catch (error: any) {
    console.error(
      "Error fetching Zoom access token:",
      error.response?.data || error.message
    );
    throw new ErrorHandler(
      "Failed to fetch Zoom access token",
      error.response?.status || 500
    );
  }
};

interface ZoomMeetingResponse {
  id: string;
  join_url: string;
}

const ensureValidToken = async () => {
  // Check if the access token is expired or not set
  if (!accessToken || Date.now() >= tokenExpiry) {
    await fetchAccessToken(); // Refresh the token
  }
};

export const createZoomMeeting = async (
  topic: string,
  startTime: string
): Promise<string> => {
  try {
    await ensureValidToken();

    const response = await axios.post<ZoomMeetingResponse>(
      `${ZOOM_API_BASE_URL}/users/${HOST_EMAIL}/meetings`,
      {
        topic,
        start_time: startTime,
        type: 2, // Scheduled meeting
        duration: 60, // 60 minutes
        timezone: "UTC",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.join_url;
  } catch (_error: any) {
    console.log(_error);
    throw new ErrorHandler("Failed to create Zoom meeting", 500);
  }
};
