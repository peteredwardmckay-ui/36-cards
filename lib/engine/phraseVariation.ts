export type PhraseId = string;
export type PhraseFamilyId = string;

export interface PhraseUsageTracker {
  usedTemplateIds: Set<PhraseId>;
  usedFamilies: Set<PhraseFamilyId>;
}

export interface PhraseTemplate<TContext = void> {
  id: PhraseId;
  family: PhraseFamilyId;
  text: string | ((context: TContext) => string);
}

export interface PhraseSelectionOptions {
  recentTemplateIds?: Iterable<PhraseId>;
  recentFamilies?: Iterable<PhraseFamilyId>;
}

const PHRASE_ID_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;

export function createPhraseUsageTracker(): PhraseUsageTracker {
  return {
    usedTemplateIds: new Set(),
    usedFamilies: new Set(),
  };
}

export function validatePhraseId(id: PhraseId): PhraseId {
  if (!PHRASE_ID_PATTERN.test(id)) {
    throw new Error(`Invalid phrase template id: ${id}`);
  }
  return id;
}

function choose<T>(values: T[], random: () => number): T {
  if (!values.length) {
    throw new Error("Cannot choose from an empty array");
  }
  return values[Math.floor(random() * values.length)];
}

function renderTemplate<TContext>(template: PhraseTemplate<TContext>, context: TContext): string {
  return typeof template.text === "function" ? template.text(context) : template.text;
}

export function chooseAvoidingRecent<TContext>(
  templates: Array<PhraseTemplate<TContext>>,
  context: TContext,
  tracker: PhraseUsageTracker,
  random: () => number,
  options: PhraseSelectionOptions = {},
): string {
  if (!templates.length) {
    throw new Error("Cannot choose from an empty phrase template pool");
  }

  templates.forEach((template) => {
    validatePhraseId(template.id);
    validatePhraseId(template.family);
  });

  const recentTemplateIds = new Set(options.recentTemplateIds ?? []);
  const recentFamilies = new Set(options.recentFamilies ?? []);
  const freshTemplates = templates.filter(
    (template) => !tracker.usedTemplateIds.has(template.id) && !recentTemplateIds.has(template.id),
  );
  const freshFamilies = freshTemplates.filter(
    (template) => !tracker.usedFamilies.has(template.family) && !recentFamilies.has(template.family),
  );
  const chosen = choose(freshFamilies.length > 0 ? freshFamilies : freshTemplates.length > 0 ? freshTemplates : templates, random);

  tracker.usedTemplateIds.add(chosen.id);
  tracker.usedFamilies.add(chosen.family);
  return renderTemplate(chosen, context);
}
