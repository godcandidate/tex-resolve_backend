import { CatchAsyncError } from "../../middlewares/catchAsyncError";

describe("CatchAsyncError", () => {
  it("should call the provided function", async () => {
    const mockFunc = jest.fn().mockResolvedValue("Success");
    const req = {} as any;
    const res = {} as any;
    const next = jest.fn();

    const wrappedFunc = CatchAsyncError(mockFunc);
    await wrappedFunc(req, res, next);

    expect(mockFunc).toHaveBeenCalledWith(req, res, next);
  });

  it("should catch errors and pass them to next", async () => {
    const mockError = new Error("Test error");
    const mockFunc = jest.fn().mockRejectedValue(mockError);
    const req = {} as any;
    const res = {} as any;
    const next = jest.fn();

    const wrappedFunc = CatchAsyncError(mockFunc);
    await wrappedFunc(req, res, next);

    expect(next).toHaveBeenCalledWith(mockError);
  });
});
