import ErrorHandler from "../../utils/ErrorHandler";

describe("Test ErrorHandler", () => {
  it("should create an error with a message and statusCode", () => {
    const error = new ErrorHandler("Test error", 400);
    expect(error.message).toBe("Test error");
    expect(error.statusCode).toBe(400);
  });

  it("should capture the stack trace", () => {
    const spy = jest.spyOn(Error, "captureStackTrace");
    new ErrorHandler("Stack trace test", 500);
    expect(spy).toHaveBeenCalled();
  });
});
