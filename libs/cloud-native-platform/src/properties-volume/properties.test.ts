import { existsSync, readdirSync, readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addTo } from "./properties.js";

// Mock file system modules
vi.mock("node:fs", () => ({
  existsSync: vi.fn(),
  readdirSync: vi.fn(),
  readFileSync: vi.fn(),
}));

const mockExistsSync = vi.mocked(existsSync);
const mockReaddirSync = vi.mocked(readdirSync);
const mockReadFileSync = vi.mocked(readFileSync);

describe("addTo", () => {
  let config: Record<string, any>;
  let consoleWarnSpy: any;

  beforeEach(() => {
    config = { existing: "value" };
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it("should add properties from default mount point", () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue(["secret1", "secret2"]);
    mockReadFileSync.mockReturnValueOnce("value1").mockReturnValueOnce("value2  ");

    addTo(config);

    expect(mockExistsSync).toHaveBeenCalledWith("/mnt/secrets");
    expect(mockReaddirSync).toHaveBeenCalledWith("/mnt/secrets");
    expect(config).toEqual({
      existing: "value",
      secret1: "value1",
      secret2: "value2",
    });
  });

  it("should add properties from custom mount point", () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue(["custom-secret"]);
    mockReadFileSync.mockReturnValue("custom-value");

    addTo(config, { mountPoint: "/custom/path" });

    expect(mockExistsSync).toHaveBeenCalledWith("/custom/path");
    expect(mockReaddirSync).toHaveBeenCalledWith("/custom/path");
    expect(config).toEqual({
      existing: "value",
      "custom-secret": "custom-value",
    });
  });

  it("should throw error when mount point does not exist and failOnError is true", () => {
    mockExistsSync.mockReturnValue(false);

    expect(() => addTo(config)).toThrow("Mount point /mnt/secrets does not exist");
    expect(config).toEqual({ existing: "value" });
  });

  it("should warn and continue when mount point does not exist and failOnError is false", () => {
    mockExistsSync.mockReturnValue(false);

    addTo(config, { failOnError: false });

    expect(consoleWarnSpy).toHaveBeenCalledWith("Properties volume: Mount point /mnt/secrets does not exist");
    expect(config).toEqual({ existing: "value" });
  });

  it("should handle file read errors when failOnError is false", () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue(["secret1", "bad-secret"]);
    mockReadFileSync.mockReturnValueOnce("value1").mockImplementationOnce(() => {
      throw new Error("Permission denied");
    });

    addTo(config, { failOnError: false });

    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining("Failed to read property file"));
    expect(config).toEqual({
      existing: "value",
      secret1: "value1",
    });
  });

  it("should throw error when file read fails and failOnError is true", () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue(["bad-secret"]);
    mockReadFileSync.mockImplementation(() => {
      throw new Error("Permission denied");
    });

    expect(() => addTo(config)).toThrow("Failed to read property file");
  });

  it("should merge properties with existing config", () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue(["existing"]);
    mockReadFileSync.mockReturnValue("new-value");

    addTo(config);

    expect(config).toEqual({
      existing: "new-value", // Should overwrite existing value
    });
  });

  it("should trim whitespace from file contents", () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue(["secret"]);
    mockReadFileSync.mockReturnValue("  value with spaces  \n");

    addTo(config);

    expect(config).toEqual({
      existing: "value",
      secret: "value with spaces",
    });
  });
});
