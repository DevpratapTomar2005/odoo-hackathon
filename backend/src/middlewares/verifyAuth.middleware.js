import express from "express";
import jwt from "jsonwebtoken";
import envConfig from "../config/env.config.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers["authorization"] ? req.headers["authorization"].split(" ")[1] : null;

  if (!authHeader) {
    throw new ApiError(401, "Unauthorized request");
  }

  const decodedToken = jwt.verify(authHeader, envConfig.JWT_SECRET);

  if (!decodedToken) {
    throw new ApiError(401, "Invalid token");
  }

  req.user = decodedToken;
  next();
});