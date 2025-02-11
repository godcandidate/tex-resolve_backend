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
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = __importDefault(require("../../utils/db"));
// Mock mongoose.connect
jest.mock('mongoose', () => ({
    connect: jest.fn(),
}));
describe('Test MongoDB Connection', () => {
    const mockConnect = mongoose_1.default.connect;
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should connect to the database successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        // Mock successful connection
        mockConnect.mockResolvedValueOnce({
            connection: { host: 'mock-host' },
        });
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        yield (0, db_1.default)();
        expect(mockConnect).toHaveBeenCalledWith(expect.any(String)); // Ensure mongoose.connect is called with the connection string
        expect(consoleSpy).toHaveBeenCalledWith('Database connected with mock-host');
        consoleSpy.mockRestore();
    }));
    it('should retry connection on failure', () => __awaiter(void 0, void 0, void 0, function* () {
        // Mock failed connection
        mockConnect.mockRejectedValueOnce(new Error('Connection failed'));
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
        yield (0, db_1.default)();
        expect(mockConnect).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
        expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000);
        consoleSpy.mockRestore();
        setTimeoutSpy.mockRestore();
    }));
    it('should handle missing DB_URI gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
        const originalEnv = process.env.DB_URI;
        delete process.env.DB_URI;
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        yield (0, db_1.default)();
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
        process.env.DB_URI = originalEnv; // Restore the original environment variable
        consoleSpy.mockRestore();
    }));
});
