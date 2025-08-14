import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs");
vi.mock("node:path");

const mockedFs = vi.mocked(fs);
const mockedPath = vi.mocked(path);

// Mock the manifest cache by resetting the module between tests
let createAssetHelpers: () => { jsEntry: string; cssEntry: string };

describe("assets utils", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    // Reset environment
    delete process.env.NODE_ENV;

    // Setup default path mocks
    mockedPath.dirname.mockReturnValue("/mock/dir");

    // Re-import the module to reset the manifest cache
    const assetsModule = await import("./assets.js");
    createAssetHelpers = assetsModule.createAssetHelpers;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("createAssetHelpers", () => {
    it("should return development asset paths when not in production", () => {
      process.env.NODE_ENV = "development";

      const helpers = createAssetHelpers();

      expect(helpers).toEqual({
        jsEntry: "/assets/js/index.ts",
        cssEntry: "/assets/css/index.scss",
      });
    });

    it("should return development asset paths when NODE_ENV is undefined", () => {
      const helpers = createAssetHelpers();

      expect(helpers).toEqual({
        jsEntry: "/assets/js/index.ts",
        cssEntry: "/assets/css/index.scss",
      });
    });

    it("should return production asset paths with hashed filenames when manifest exists", () => {
      process.env.NODE_ENV = "production";

      const mockManifest = {
        "js/index.ts": {
          file: "js/index.abc123.js",
          isEntry: true,
        },
        "css/index.scss": {
          file: "css/index.def456.css",
          isEntry: true,
        },
      };

      mockedPath.join.mockReturnValue("/path/to/manifest.json");
      mockedPath.dirname.mockReturnValue("/path/to");
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockManifest));

      const helpers = createAssetHelpers();

      expect(helpers).toEqual({
        jsEntry: "/assets/js/index.abc123.js",
        cssEntry: "/assets/css/index.def456.css",
      });
    });

    it("should return original entry paths when manifest exists but entry is not found", () => {
      process.env.NODE_ENV = "production";

      const mockManifest = {
        "other/file.ts": {
          file: "other/file.abc123.js",
          isEntry: true,
        },
      };

      mockedPath.join.mockReturnValue("/path/to/manifest.json");
      mockedPath.dirname.mockReturnValue("/path/to");
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockManifest));

      const helpers = createAssetHelpers();

      expect(helpers).toEqual({
        jsEntry: "/assets/js/index.ts",
        cssEntry: "/assets/css/index.scss",
      });
    });

    it("should return original entry paths when manifest file does not exist", () => {
      process.env.NODE_ENV = "production";

      mockedPath.join.mockReturnValue("/path/to/manifest.json");
      mockedPath.dirname.mockReturnValue("/path/to");
      mockedFs.existsSync.mockReturnValue(false);

      const helpers = createAssetHelpers();

      expect(helpers).toEqual({
        jsEntry: "/assets/js/index.ts",
        cssEntry: "/assets/css/index.scss",
      });
    });

    it("should handle manifest file read errors gracefully", () => {
      process.env.NODE_ENV = "production";

      mockedPath.join.mockReturnValue("/path/to/manifest.json");
      mockedPath.dirname.mockReturnValue("/path/to");
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error("File read error");
      });

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const helpers = createAssetHelpers();

      expect(helpers).toEqual({
        jsEntry: "/assets/js/index.ts",
        cssEntry: "/assets/css/index.scss",
      });

      expect(consoleSpy).toHaveBeenCalledWith("Failed to load Vite manifest:", expect.any(Error));

      consoleSpy.mockRestore();
    });

    it("should handle invalid JSON in manifest file", () => {
      process.env.NODE_ENV = "production";

      mockedPath.join.mockReturnValue("/path/to/manifest.json");
      mockedPath.dirname.mockReturnValue("/path/to");
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue("invalid json");

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const helpers = createAssetHelpers();

      expect(helpers).toEqual({
        jsEntry: "/assets/js/index.ts",
        cssEntry: "/assets/css/index.scss",
      });

      expect(consoleSpy).toHaveBeenCalledWith("Failed to load Vite manifest:", expect.any(SyntaxError));

      consoleSpy.mockRestore();
    });

    it("should cache manifest after first load", () => {
      process.env.NODE_ENV = "production";

      const mockManifest = {
        "js/index.ts": {
          file: "js/index.cached123.js",
          isEntry: true,
        },
        "css/index.scss": {
          file: "css/index.cached456.css",
          isEntry: true,
        },
      };

      mockedPath.join.mockReturnValue("/path/to/manifest.json");
      mockedPath.dirname.mockReturnValue("/path/to");
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockManifest));

      // First call
      const helpers1 = createAssetHelpers();

      // Second call should use cached manifest
      const helpers2 = createAssetHelpers();

      expect(helpers1).toEqual(helpers2);
      expect(mockedFs.readFileSync).toHaveBeenCalledTimes(1);
    });
  });
});
