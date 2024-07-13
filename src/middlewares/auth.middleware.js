import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.models.js";

export const jwtVerify = asyncHandler(async (req, _, next) => {
  try {
    console.log("Request Headers: ", req.headers);
    console.log("Request Cookies: ", req.cookies)
      // Replace "Bearer" with "" and trim any leading/trailing whitespace
      const token = req.cookies?.accesToken || req.header("Authorization")?.replace("Bearer ", "").trim();
      console.log("token is ", token);

      if (!token) {
          throw new ApiError(400, "Unauthorized user");
      }

      const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
      console.log(`decoded token -> ${decodedToken}`);

      const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
      console.log(user);

      if (!user) {
          throw new ApiError(401, "Invalid access token");
      }

      req.user = user;
      console.log(req.user);
      next();
  } catch (error) {
      throw new ApiError(500, error?.message ||"server  errror");
  }
});