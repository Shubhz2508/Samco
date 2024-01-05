import { rateLimit } from "express-rate-limit";

export const userLimiter = rateLimit({
    windowMs: 60 * 1000, // 24 hrs in milliseconds
    max: 8,
    message: "Server Error",
    standardHeaders: true,
    legacyHeaders: false,
});