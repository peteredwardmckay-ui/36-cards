import { composeReading } from "@/lib/engine/compose";
import { createRequestId, errorJson, okJson } from "@/lib/server/apiResponse";
import {
  buildReadingStateFromRequest,
  isReadingRequestPayload,
  parseJsonBodyWithLimit,
} from "@/lib/server/requestValidation";

const MAX_READING_REQUEST_BYTES = 64_000;

export async function POST(request: Request) {
  const requestId = createRequestId();
  const startedAt = Date.now();

  try {
    const parsedBody = await parseJsonBodyWithLimit(
      request,
      MAX_READING_REQUEST_BYTES,
      "Reading payload too large.",
    );
    if (!parsedBody.ok) {
      return errorJson(parsedBody.message, requestId, parsedBody.status);
    }

    const payload = parsedBody.value as { state?: unknown };

    if (!isReadingRequestPayload(payload.state)) {
      return errorJson("Invalid reading payload.", requestId, 400);
    }

    const state = buildReadingStateFromRequest(payload.state);
    const reading = composeReading(state);
    console.info("[reading-api]", {
      requestId,
      subjectId: state.setup.subjectId,
      readingStyle: state.setup.readingStyle,
      spreadType: state.setup.spreadType,
      durationMs: Date.now() - startedAt,
    });

    return okJson({ reading }, requestId);
  } catch {
    console.error("[reading-api] generation-failed", {
      requestId,
      durationMs: Date.now() - startedAt,
    });
    return errorJson("Unable to generate reading.", requestId, 500);
  }
}
