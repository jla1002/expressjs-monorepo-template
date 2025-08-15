import { describe, expect, it } from "vitest";
import { healthcheck } from "./index.js";

describe("healthcheck export", () => {
  it("should expose all healthcheck functions", () => {
    expect(healthcheck).toBeDefined();
    expect(healthcheck.configure).toBeInstanceOf(Function);
    expect(healthcheck.web).toBeInstanceOf(Function);
    expect(healthcheck.raw).toBeInstanceOf(Function);
    expect(healthcheck.up).toBeInstanceOf(Function);
    expect(healthcheck.down).toBeInstanceOf(Function);
  });

  it("should create working health checks", async () => {
    const webCheck = healthcheck.web("https://example.com");
    expect(webCheck).toBeInstanceOf(Function);

    const rawCheck = healthcheck.raw(() => healthcheck.up());
    expect(await rawCheck()).toBe("UP");

    const middleware = healthcheck.configure({
      checks: {
        test: healthcheck.raw(() => healthcheck.down()),
      },
    });
    expect(middleware).toBeInstanceOf(Function);
  });
});
