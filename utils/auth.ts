import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncError";
import ErrorHandler from "./ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "./redis";

import 'dotenv/config';

import { IUser } from "../models/user.model";

//using interface for req.user
declare module 'express' {
  interface Request {
    user?: IUser;
  }
}

//Authenticate user
export const isAuthenticated = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
          const access_token = req.cookies.access_token;

          if(!access_token){
              return next(new ErrorHandler("Please login to access this resource", 400));
          }
 
          //Verify token
          const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN as string) as JwtPayload;
          if(!decoded){
            return next(new ErrorHandler("Access token not valid", 400));
          }

          //Get user
          const user = await redis.get(decoded.id) as any;
          if(!user){
            return next(new ErrorHandler("User not found", 400));
          }
          req.user = JSON.parse(user);
          next();

      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
  );

//validate user role
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(
          `Role: ${req.user?.role} is not allowed to access this resource`, 403
        )
      );
    }
    next();
  };
};