import jwt from "jsonwebtoken";
import envConfig from "../config/env.config.js";

export const generateAccessToken = (user, sessionId) => {
  const payload = {
    id: user.id,
    email: user.email,
    sid: sessionId,
    role: user.role,
  };
  return jwt.sign(payload, envConfig.JWT_SECRET, { expiresIn: "1m" });
};

export const generateRefreshToken = (user, sessionId) => {
  const payload = {
    id: user.id,
    email: user.email,
    sid: sessionId,
    role: user.role,
  };
  return jwt.sign(payload, envConfig.JWT_SECRET, { expiresIn: "7d" });
};
