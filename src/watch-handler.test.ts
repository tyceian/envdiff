import { handleWatch } from "./watch-handler";
import * as loader from "./loader";
import * as diff from "./diff";
import * as reporter from "./reporter";
import * as watcher from "./watcher";

jest.mock("./loader");
jest.mock("./diff");
jest.mock("./reporter");
jest.mock("./watcher");

const mockLoadEnvFiles = loader.loadEnvFiles as jest.Mock;
const mockDiffEnvMaps = diff.diffEnvMaps as jest.Mock;
const mockFormatReport = reporter.formatReport as jest.Mock;
const mockWatchEnvFiles = watcher.watchEnvFiles as jest.Mock;
const mockStopWatchers = watcher.stopWatchers as jest.Mock;

describe("handleWatch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadEnvFiles.mockResolvedValue([new Map(), new Map()]);
    mockDiffEnvMaps.mockReturnValue([]);
    mockFormatReport.mockReturnValue("mock report");
    mockWatchEnvFiles.mockReturnValue([{ close: jest.fn() }]);
  });

  it("throws if fewer than 2 files provided", async () => {
    await expect(handleWatch([".env"])).rejects.toThrow(
      "At least two .env files are required"
    );
  });

  it("runs an initial diff on start", async () => {
    await handleWatch([".env.dev", ".env.prod"], { silent: true });
    expect(mockLoadEnvFiles).toHaveBeenCalledWith([".env.dev", ".env.prod"]);
    expect(mockDiffEnvMaps).toHaveBeenCalled();
    expect(mockFormatReport).toHaveBeenCalled();
  });

  it("returns a stop function that closes watchers", async () => {
    const fakeWatcher = { close: jest.fn() };
    mockWatchEnvFiles.mockReturnValue([fakeWatcher]);

    const stop = await handleWatch([".env.dev", ".env.prod"], { silent: true });
    stop();

    expect(mockStopWatchers).toHaveBeenCalledWith([fakeWatcher]);
  });

  it("sets up file watchers for all provided paths", async () => {
    await handleWatch([".env.a", ".env.b", ".env.c"], { silent: true });
    expect(mockWatchEnvFiles).toHaveBeenCalledWith(
      [".env.a", ".env.b", ".env.c"],
      expect.any(Function),
      expect.objectContaining({ silent: true })
    );
  });

  it("handles load errors gracefully in silent mode", async () => {
    mockLoadEnvFiles.mockRejectedValueOnce(new Error("file not found"));
    await expect(
      handleWatch([".env.dev", ".env.prod"], { silent: true })
    ).resolves.not.toThrow();
  });
});
