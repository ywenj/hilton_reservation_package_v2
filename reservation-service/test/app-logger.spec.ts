import { AppLogger } from "../src/common/logging/app-logger";

describe("AppLogger", () => {
  const originalEnv = { ...process.env };
  let originalConsoleLog: any;

  beforeEach(() => {
    originalConsoleLog = console.log;
    console.log = jest.fn();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    console.log = originalConsoleLog;
    jest.clearAllMocks();
  });

  it("filters out debug logs when LOG_LEVEL=warn", () => {
    process.env.LOG_LEVEL = "warn";
    process.env.SERVICE_NAME = "test-service";
    const logger = new AppLogger();
    logger.debug("debug message");
    logger.warn("warn message");
    // Should only emit warn
    expect(console.log).toHaveBeenCalledTimes(1);
    const arg = (console.log as jest.Mock).mock.calls[0][0];
    expect(String(arg)).toContain("[WARN]");
    expect(String(arg)).toContain("warn message");
  });

  it("emits debug when LOG_LEVEL=debug", () => {
    process.env.LOG_LEVEL = "debug";
    process.env.SERVICE_NAME = "test-service";
    const logger = new AppLogger();
    logger.debug("debug message");
    expect(console.log).toHaveBeenCalled();
    const arg = (console.log as jest.Mock).mock.calls[0][0];
    expect(String(arg)).toContain("[DEBUG]");
  });

  it("outputs JSON when LOG_JSON=true", () => {
    process.env.LOG_LEVEL = "log";
    process.env.LOG_JSON = "true";
    process.env.SERVICE_NAME = "json-service";
    const logger = new AppLogger();
    logger.attachRequest({
      headers: { "x-request-id": "req123" },
      user: { sub: "user456" },
    });
    logger.log("hello world");
    expect(console.log).toHaveBeenCalledTimes(1);
    const raw = (console.log as jest.Mock).mock.calls[0][0];
    // Should be a JSON string
    const parsed = JSON.parse(raw);
    expect(parsed.service).toBe("json-service");
    expect(parsed.msg).toBe("hello world");
    expect(parsed.requestId).toBe("req123");
    expect(parsed.userId).toBe("user456");
    expect(parsed.level).toBe("log");
  });
});
