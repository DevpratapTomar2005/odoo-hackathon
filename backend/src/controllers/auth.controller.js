import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { eq, and } from "drizzle-orm";
import { db } from "../db/db.js";
import { usersTable, sessionsTable } from "../db/schema.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import envConfig from "../config/env.config.js";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role} = req.body;

  if (!name || !email || !password || !role) {
    throw new ApiError(400, "Name, email, password, and role are required");
  }

  const existingUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (existingUser.length > 0) {
    throw new ApiError(400, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [newUser] = await db
    .insert(usersTable)
    .values({
      name,
      email,
      password: hashedPassword,
      role: role,
    })
    .returning();

  const sessionId = randomUUID();

  const accessToken = generateAccessToken(newUser, sessionId);
  const refreshToken = generateRefreshToken(newUser, sessionId);

  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  await db.insert(sessionsTable).values({
    id: sessionId,
    userId: newUser.id,
    refreshToken: hashedRefreshToken,
    ip: req.ip,
    userAgent: req.headers["user-agent"] || "unknown",
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  return res
    .status(201)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        201,
        { user: newUser, accessToken },
        "User registered successfully",
      ),
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (user.length === 0) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, user[0].password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const sessionId = randomUUID();

  const accessToken = generateAccessToken(user[0], sessionId);
  const refreshToken = generateRefreshToken(user[0], sessionId);

  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  await db.insert(sessionsTable).values({
    id: sessionId,
    userId: user[0].id,
    refreshToken: hashedRefreshToken,
    ip: req.ip,
    userAgent: req.headers["user-agent"] || "unknown",
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, { user: user[0], accessToken }, "Login successful"),
    );
});


const refreshToken = asyncHandler(async (req, res) => {

  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token not found");
  }

  const decodedToken = jwt.verify(refreshToken, envConfig.JWT_SECRET);

  if (!decodedToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const sessionId = randomUUID();

  const accessToken = generateAccessToken(decodedToken, sessionId);
  const newRefreshToken = generateRefreshToken(decodedToken, sessionId);

  const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);

  const [session] = await db.update(sessionsTable)
    .set({ refreshToken: hashedRefreshToken })
    .where(and(eq(sessionsTable.id, decodedToken.sid), eq(sessionsTable.revoked, false))).returning();

  if (!session) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  return res
    .status(200)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(
      new ApiResponse(200, { accessToken }, "Token refreshed successfully"),
    );
});


const logoutUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token not found");
  }

  const decodedToken = jwt.verify(refreshToken, envConfig.JWT_SECRET, { ignoreExpiration: true });

  if (!decodedToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  await db.update(sessionsTable)
    .set({ revoked: true })
    .where(and(eq(sessionsTable.id, decodedToken.sid), eq(sessionsTable.revoked, false)));

  
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  };


  return res
    .status(200)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

const getUsersByRole = asyncHandler(async (req, res) => {
  const { role } = req.query;

  if (!role) {
    throw new ApiError(400, "Role query parameter is required");
  }

  const users = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
    })
    .from(usersTable)
    .where(eq(usersTable.role, role));

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users retrieved successfully"));
});

export default {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getUsersByRole
};
