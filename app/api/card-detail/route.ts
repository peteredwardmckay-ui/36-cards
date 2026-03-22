import { composeCardDetail } from "@/lib/engine/compose";
import { createRequestId, errorJson, okJson } from "@/lib/server/apiResponse";
import {
  buildReadingStateFromRequest,
  isCardDetailRequestPayload,
  parseJsonBodyWithLimit,
} from "@/lib/server/requestValidation";

const MAX_CARD_DETAIL_REQUEST_BYTES = 64_000;

export async function POST(request: Request) {
  const requestId = createRequestId();

  try {
    const parsedBody = await parseJsonBodyWithLimit(
      request,
      MAX_CARD_DETAIL_REQUEST_BYTES,
      "Card detail payload too large.",
    );
    if (!parsedBody.ok) {
      return errorJson(parsedBody.message, requestId, parsedBody.status);
    }

    const payload = parsedBody.value as { state?: unknown };

    if (!isCardDetailRequestPayload(payload.state)) {
      return errorJson("Invalid card detail payload.", requestId, 400);
    }

    const state = buildReadingStateFromRequest(payload.state, payload.state.position);
    const detail = composeCardDetail(state, payload.state.position);
    console.info("[card-detail-api]", {
      requestId,
      subjectId: state.setup.subjectId,
      position: payload.state.position,
    });
    return okJson({ detail }, requestId);
  } catch {
    console.error("[card-detail-api] generation-failed", { requestId });
    return errorJson("Unable to generate card detail.", requestId, 500);
  }
}
