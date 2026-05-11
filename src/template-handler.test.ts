import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { handleTemplate } from "./template-handler";

function writeTempEnv(content: string): string {
  const file = path.join(os.tmpdir(), `envdiff-tpl-${Date.now()}-${Math.random()}.env`);
  fs.writeFileSync(file, content, "utf-8");
  return file;
}

describe("handleTemplate", () => {
  let consoleSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("exits with error when no files provided", async () => {
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });
    await expect(handleTemplate({ files: [] })).rejects.toThrow("exit");
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("at least one"));
    exitSpy.mockRestore();
  });

  it("prints template to stdout", async () => {
    const f = writeTempEnv("PORT=3000\nDEBUG=true\n");
    await handleTemplate({ files: [f] });
    const output = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(output).toContain("PORT=");
    expect(output).toContain("DEBUG=");
    fs.unlinkSync(f);
  });

  it("writes template to output file", async () => {
    const f = writeTempEnv("API_KEY=secret\n");
    const outFile = path.join(os.tmpdir(), `envdiff-out-${Date.now()}.env`);
    await handleTemplate({ files: [f], output: outFile });
    const written = fs.readFileSync(outFile, "utf-8");
    expect(written).toContain("API_KEY=");
    expect(written).not.toContain("secret");
    fs.unlinkSync(f);
    fs.unlinkSync(outFile);
  });

  it("merges keys from multiple files", async () => {
    const f1 = writeTempEnv("A=1\n");
    const f2 = writeTempEnv("B=2\n");
    await handleTemplate({ files: [f1, f2] });
    const output = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(output).toContain("A=");
    expect(output).toContain("B=");
    fs.unlinkSync(f1);
    fs.unlinkSync(f2);
  });
});
