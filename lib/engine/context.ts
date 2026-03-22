import { getSubjectFallbackDomain } from "@/lib/content/subjects";
import type { Domain, SignificatorMode, SubjectId } from "@/lib/engine/types";

const SUBJECT_TERMS: Record<SubjectId, string[]> = {
  general_reading: ["overall", "general", "broad", "what should i know", "overview", "energy"],
  love: ["love", "relationship", "dating", "partner", "romance", "marriage", "crush", "ex", "reconciliation"],
  work: ["career", "job", "work", "boss", "team", "promotion", "office", "employer", "coworker"],
  money: ["money", "finance", "financial", "cash", "income", "debt", "budget", "expenses", "afford"],
  home_family: ["family", "home", "household", "children", "relative", "caregiving", "living", "domestic"],
  friends_social: ["friend", "friends", "social", "peer", "group", "gossip", "belonging"],
  personal_growth: ["growth", "healing", "self", "pattern", "transition", "self-trust", "boundary", "grounding"],
  health: ["health", "wellbeing", "energy", "recovery", "stress", "rest", "routine", "fatigue"],
  pets: ["pet", "dog", "cat", "animal", "companion", "vet"],
  creative: ["creative", "art", "writing", "design", "music", "project", "inspiration", "block"],
  travel: ["travel", "trip", "journey", "flight", "move", "distance", "transit", "relocation"],
  education: ["study", "school", "course", "exam", "qualification", "training", "university", "learning"],
  spiritual: ["spiritual", "intuition", "faith", "guidance", "sign", "sacred", "alignment"],
  community: ["community", "audience", "collective", "network", "belonging", "neighborhood", "group role"],
  legal_admin: ["legal", "contract", "document", "paperwork", "deadline", "approval", "compliance", "bureaucracy"],
  purpose_calling: ["purpose", "calling", "vocation", "life path", "meaning", "right path", "alignment"],
};

export function inferSubjectFromQuestion(question: string): SubjectId {
  const q = question.toLowerCase();
  let bestSubject: SubjectId = "general_reading";
  let bestScore = 0;
  let tie = false;

  (Object.keys(SUBJECT_TERMS) as SubjectId[]).forEach((subjectId) => {
    if (subjectId === "general_reading") return;
    const score = SUBJECT_TERMS[subjectId].filter((term) => q.includes(term)).length;
    if (score > bestScore) {
      bestScore = score;
      bestSubject = subjectId;
      tie = false;
      return;
    }
    if (score > 0 && score === bestScore) {
      tie = true;
    }
  });

  if (bestScore <= 0 || tie) {
    return "general_reading";
  }

  return bestSubject;
}

export function getDomainForSubject(subjectId: SubjectId): Domain {
  return getSubjectFallbackDomain(subjectId);
}

export function inferDomainFromQuestion(question: string): Domain {
  return getDomainForSubject(inferSubjectFromQuestion(question));
}

export function inferCounterpartRole(question: string, mode: SignificatorMode): string {
  if (mode === "relationship") return "the relationship itself";
  if (mode === "self") return "how you're showing up";
  if (mode === "other") return "the other person's position";

  const q = question.toLowerCase();
  if (q.includes("boss") || q.includes("manager")) return "the dynamic with your employer";
  if (q.includes("friend")) return "the dynamic with your friend";
  if (q.includes("partner") || q.includes("relationship")) return "the dynamic with your partner";
  if (q.includes("client")) return "the dynamic with your client";
  return "the dynamic between you and the counterpart";
}
