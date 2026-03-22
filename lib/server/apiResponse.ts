import { NextResponse } from "next/server";

function makeHeaders(requestId: string, extra: HeadersInit = {}) {
  return {
    "cache-control": "no-store, max-age=0",
    "x-content-type-options": "nosniff",
    "x-request-id": requestId,
    ...extra,
  };
}

export function createRequestId() {
  return crypto.randomUUID();
}

export function okJson<T>(data: T, requestId: string, status = 200, extraHeaders: HeadersInit = {}) {
  return NextResponse.json(data, {
    status,
    headers: makeHeaders(requestId, extraHeaders),
  });
}

export function errorJson(message: string, requestId: string, status = 500, extraHeaders: HeadersInit = {}) {
  return NextResponse.json(
    {
      error: {
        message,
        requestId,
      },
    },
    {
      status,
      headers: makeHeaders(requestId, extraHeaders),
    },
  );
}
