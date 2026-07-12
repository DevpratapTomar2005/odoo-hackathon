import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";


export const authorizeRoles = (...allowedRoles) => {
    return asyncHandler(async (req, res, next) => { 
        const userRole = req.user?.role;

        if (!userRole) {
            throw new ApiError(401, "Unauthorized: User role not found");
        }

        if (!allowedRoles.includes(userRole)) {
            throw new ApiError(403, "Forbidden: Insufficient permissions");
        }

        next();
    })
}