import mongoose from 'mongoose';
import connectDB from '../../utils/db';

// Mock mongoose.connect
jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

describe('Test MongoDB Connection', () => {
  const mockConnect = mongoose.connect as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to the database successfully', async () => {
    // Mock successful connection
    mockConnect.mockResolvedValueOnce({
      connection: { host: 'mock-host' },
    });

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await connectDB();

    expect(mockConnect).toHaveBeenCalledWith(expect.any(String)); // Ensure mongoose.connect is called with the connection string
    expect(consoleSpy).toHaveBeenCalledWith('Database connected with mock-host');

    consoleSpy.mockRestore();
  });

  it('should retry connection on failure', async () => {
    // Mock failed connection
    mockConnect.mockRejectedValueOnce(new Error('Connection failed'));

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

    await connectDB();

    expect(mockConnect).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000);

    consoleSpy.mockRestore();
    setTimeoutSpy.mockRestore();
  });

  it('should handle missing DB_URI gracefully', async () => {
    const originalEnv = process.env.DB_URI;
    delete process.env.DB_URI;

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await connectDB();

    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));

    process.env.DB_URI = originalEnv; // Restore the original environment variable
    consoleSpy.mockRestore();
  });
});
