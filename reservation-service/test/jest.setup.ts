// Global test cleanup to avoid Jest open handle warnings.
import mongoose from "mongoose";

afterAll(async () => {
  // Clear timers
  jest.clearAllTimers();
  // Disconnect mongoose if a real connection was opened (readyState 1 or 2)
  try {
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  } catch (e) {
    // swallow disconnect errors in tests
  }
});
