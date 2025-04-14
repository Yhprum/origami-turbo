import { db } from "@/db";
import { tokens } from "@/db/schema";
import axios from "axios";

const accessToken = {
  value: "",
  expiresAt: 0,
};
let refreshToken = "";
const redirectUri = "https://127.0.0.1:3001/token";

// Add refresh lock mechanism
let refreshPromise: Promise<void> | null = null;

export async function getAuthToken(authorizationCode: string) {
  // Base64 encode the client_id:client_secret
  const base64Credentials = Buffer.from(
    `${Bun.env.SCHWAB_CLIENT_ID}:${Bun.env.SCHWAB_CLIENT_SECRET}`
  ).toString("base64");

  try {
    const response = await axios({
      method: "POST",
      url: "https://api.schwabapi.com/v1/oauth/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${base64Credentials}`,
      },
      data: `grant_type=authorization_code&code=${authorizationCode}&redirect_uri=${redirectUri}`,
    });

    // refresh token expires in one week
    await db.insert(tokens).values({
      refreshToken: response.data.refresh_token,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    accessToken.value = response.data.access_token;
    accessToken.expiresAt = Date.now() + response.data.expires_in * 1000;
    refreshToken = response.data.refresh_token;
  } catch (error) {
    console.error("Error fetching auth token:", error);
    throw error;
  }
}

async function refreshAuthToken() {
  // If there's already a refresh in progress, wait for it
  if (refreshPromise) {
    return refreshPromise;
  }

  // Create a new refresh promise
  refreshPromise = (async () => {
    console.log("*** REFRESHING ACCESS TOKEN ***");
    // Base64 encode the client_id:client_secret
    const base64Credentials = Buffer.from(
      `${Bun.env.SCHWAB_CLIENT_ID}:${Bun.env.SCHWAB_CLIENT_SECRET}`
    ).toString("base64");

    try {
      const response = await axios({
        method: "POST",
        url: "https://api.schwabapi.com/v1/oauth/token",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${base64Credentials}`,
        },
        data: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
      });

      accessToken.value = response.data.access_token;
      accessToken.expiresAt = Date.now() + response.data.expires_in * 1000;

      return response.data;
    } catch (error: any) {
      console.error(
        "Error refreshing auth token:",
        error.response ? error.response.data : error.message
      );
      throw error;
    } finally {
      // Clear the refresh promise when done
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function getSchwabAuthToken() {
  if (!accessToken || !refreshToken) {
    const token = await db.query.tokens.findFirst();
    if (!token || token.expiresAt < Date.now()) {
      await db.delete(tokens);
      throw new Error("No access token or refresh token found");
    }
    refreshToken = token.refreshToken;
    await refreshAuthToken();
  }

  if (accessToken.expiresAt < Date.now()) {
    await refreshAuthToken();
  }

  return accessToken.value;
}
