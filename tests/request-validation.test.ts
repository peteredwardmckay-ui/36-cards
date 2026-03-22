import { describe, expect, it } from "vitest";
import { parseJsonBodyWithLimit } from "@/lib/server/requestValidation";

describe("request validation", () => {
  it("parses JSON when content-length is absent", async () => {
    const request = new Request("https://example.com/api/reading", {
      method: "POST",
      body: JSON.stringify({ state: { id: "reading-1" } }),
      headers: {
        "content-type": "application/json",
      },
    });

    const result = await parseJsonBodyWithLimit(request, 128, "Too large.");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ state: { id: "reading-1" } });
    }
  });

  it("rejects oversized JSON even when content-length is absent", async () => {
    const request = new Request("https://example.com/api/reading", {
      method: "POST",
      body: JSON.stringify({
        state: {
          id: "reading-1",
          text: "x".repeat(200),
        },
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const result = await parseJsonBodyWithLimit(request, 64, "Too large.");
    expect(result).toEqual({
      ok: false,
      status: 413,
      message: "Too large.",
    });
  });

  it("returns 400 for invalid JSON", async () => {
    const request = new Request("https://example.com/api/reading", {
      method: "POST",
      body: "{ not-json ",
      headers: {
        "content-type": "application/json",
      },
    });

    const result = await parseJsonBodyWithLimit(request, 128, "Too large.");
    expect(result).toEqual({
      ok: false,
      status: 400,
      message: "Invalid JSON payload.",
    });
  });
});
