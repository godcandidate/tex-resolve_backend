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
exports.authorizeRoles = exports.isAuthenticated = void 0;
const catchAsyncError_1 = require("../middlewares/catchAsyncError");
const ErrorHandler_1 = __importDefault(require("./ErrorHandler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_1 = require("./redis");
require("dotenv/config");
//Authenticate user
exports.isAuthenticated = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const access_token = req.cookies.access_token;
        // if(!access_token){
        //     return next(new ErrorHandler("Please login to access this resource", 400));
        // }
        // Access the authorization header to validate the request
        const authHeader = req.headers.authorization;
        // made changes to fit swagger api docs
        if (!authHeader /*|| !authHeader.startsWith("Bearer ")*/) {
            return res.status(401).json({ error: "Authentication Failed" });
        }
        // Extract the token from the authorization header
        //const token = authHeader.split(" ")[1];
        console.log("authHeader", authHeader);
        const token = authHeader.split(" ")[1];
        //const token = authHeader;
        //Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN);
        if (!decoded) {
            return next(new ErrorHandler_1.default("Access token not valid", 400));
        }
        //Get user
        const user = yield redis_1.redis.get(decoded.id);
        if (!user) {
            return next(new ErrorHandler_1.default("User not found", 400));
        }
        req.user = JSON.parse(user);
        next();
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
//validate user role
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        var _a, _b;
        if (!roles.includes(((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || "")) {
            return next(new ErrorHandler_1.default(`Role: ${(_b = req.user) === null || _b === void 0 ? void 0 : _b.role} is not allowed to access this resource`, 403));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
