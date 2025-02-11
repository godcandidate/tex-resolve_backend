"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorHandler_1 = __importDefault(require("../../utils/ErrorHandler"));
describe("Test ErrorHandler", () => {
    it("should create an error with a message and statusCode", () => {
        const error = new ErrorHandler_1.default("Test error", 400);
        expect(error.message).toBe("Test error");
        expect(error.statusCode).toBe(400);
    });
    it("should capture the stack trace", () => {
        const spy = jest.spyOn(Error, "captureStackTrace");
        new ErrorHandler_1.default("Stack trace test", 500);
        expect(spy).toHaveBeenCalled();
    });
});
