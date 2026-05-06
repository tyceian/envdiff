import { describe, it, expect } from "vitest";
import {
  isSensitiveKey,
  redactValue,
  redactEnvMap,
  redactAllEnvMaps,
} from "./redactor";

function makeMap(entries: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(entries));
}

describe("isSensitiveKey", () => {
  it("detects password keys", () => {
    expect(isSensitiveKey("DB_PASSWORD")).toBe(true);
    expect(isSensitiveKey("password")).toBe(true);
  });

  it("detects token keys", () => {
    expect(isSensitiveKey("AUTH_TOKEN")).toBe(true);
    expect(isSensitiveKey("API_TOKEN")).toBe(true);
  });

  it("detects api key variants", () => {
    expect(isSensitiveKey("STRIPE_API_KEY")).toBe(true);
    expect(isSensitiveKey("APIKEY")).toBe(true);
  });

  it("does not flag non-sensitive keys", () => {
    expect(isSensitiveKey("APP_NAME")).toBe(false);
    expect(isSensitiveKey("PORT")).toBe(false);
    expect(isSensitiveKey("NODE_ENV")).toBe(false);
  });

  it("supports custom patterns", () => {
    expect(isSensitiveKey("MY_CUSTOM", [/custom/i])).toBe(true);
    expect(isSensitiveKey("APP_NAME", [/custom/i])).toBe(false);
  });
});

describe("redactValue", () => {
  it("replaces value with default replacement", () => {
    expect(redactValue("supersecret")).toBe("***");
  });

  it("uses custom replacement", () => {
    expect(redactValue("supersecret", "[REDACTED]")).toBe("[REDACTED]");
  });

  it("preserves empty string", () => {
    expect(redactValue("")).toBe("");
  });
});

describe("redactEnvMap", () => {
  it("redacts sensitive keys and preserves others", () => {
    const map = makeMap({
      APP_NAME: "myapp",
      DB_PASSWORD: "secret123",
      PORT: "3000",
      AUTH_TOKEN: "tok_abc",
    });
    const result = redactEnvMap(map);
    expect(result.get("APP_NAME")).toBe("myapp");
    expect(result.get("PORT")).toBe("3000");
    expect(result.get("DB_PASSWORD")).toBe("***");
    expect(result.get("AUTH_TOKEN")).toBe("***");
  });

  it("uses custom replacement string", () => {
    const map = makeMap({ SECRET_KEY: "abc" });
    const result = redactEnvMap(map, { replacement: "[hidden]" });
    expect(result.get("SECRET_KEY")).toBe("[hidden]");
  });
});

describe("redactAllEnvMaps", () => {
  it("redacts all env maps in a collection", () => {
    const maps = new Map([
      ["dev", makeMap({ APP_NAME: "app", DB_PASSWORD: "devpass" })],
      ["prod", makeMap({ APP_NAME: "app", DB_PASSWORD: "prodpass" })],
    ]);
    const result = redactAllEnvMaps(maps);
    expect(result.get("dev")?.get("DB_PASSWORD")).toBe("***");
    expect(result.get("prod")?.get("DB_PASSWORD")).toBe("***");
    expect(result.get("dev")?.get("APP_NAME")).toBe("app");
  });
});
