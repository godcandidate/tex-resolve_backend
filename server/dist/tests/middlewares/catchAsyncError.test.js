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
Object.defineProperty(exports, "__esModule", { value: true });
const catchAsyncError_1 = require("../../middlewares/catchAsyncError");
describe("CatchAsyncError", () => {
    it("should call the provided function", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockFunc = jest.fn().mockResolvedValue("Success");
        const req = {};
        const res = {};
        const next = jest.fn();
        const wrappedFunc = (0, catchAsyncError_1.CatchAsyncError)(mockFunc);
        yield wrappedFunc(req, res, next);
        expect(mockFunc).toHaveBeenCalledWith(req, res, next);
    }));
    it("should catch errors and pass them to next", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockError = new Error("Test error");
        const mockFunc = jest.fn().mockRejectedValue(mockError);
        const req = {};
        const res = {};
        const next = jest.fn();
        const wrappedFunc = (0, catchAsyncError_1.CatchAsyncError)(mockFunc);
        yield wrappedFunc(req, res, next);
        expect(next).toHaveBeenCalledWith(mockError);
    }));
});
