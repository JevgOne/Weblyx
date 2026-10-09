import { nanoid } from 'nanoid';
import { turso } from '@/lib/turso';
import { ALL_QUESTIONS, answerText, progress, type Answers } from '@/lib/consultation/questions';

/**
 * Consultation answers live with the enquiry they belong to (`leads.consultation`).
 *
 * A consultation without an enquiry behind it — someone who phoned, a referral
 * — gets one created, so every client is in Poptávky exactly once. The answers
 * that have a column of their own on the enquiry are copied there on each
 * save, which is what feeds the existing brief and the lead's card.
 */
export interface Consultation {
  leadId: string;
  name: string;
  company: string;
  status: string;
  answers: Answers;
  updatedAt: number | null;
  updatedBy: string;
}

const parse = (raw: unknown): { answers: Answers; updatedAt: number | null; updatedBy: string } => {
  try {
    const data = raw ? JSON.parse(String(raw)) : null;
    if (data && typeof data.answers === 'object') return { answers: data.answers, updatedAt: data.updatedAt ?? null, updatedBy: data.updatedBy ?? '' };
  } catch {
    /* unreadable: start empty rather than fail the call */
  }
  return { answers: {}, updatedAt: null, updatedBy: '' };
};

/** What the enquiry already knows, so the caller does not ask for it again. */
const PREFILL: Array<[question: string, column: string]> = [
  ['contactName', 'name'], ['company', 'company'], ['phone', 'phone'], ['email', 'email'], ['ico', 'ico'],
  ['about', 'business_description'], ['industry', 'industry'], ['existingWebsite', 'existing_website'],
  ['whyNow', 'project_reason'], ['usp', 'usp'], ['competitors', 'top_competitors'], ['acquisition', 'customer_acquisition'],
  ['budget', 'budget_range'], ['launch', 'timeline'], ['custom', 'additional_requirements'],
];

export async function getConsultation(leadId: string): Promise<Consultation | null> {
  const result = await turso.execute({ sql: 'SELECT * FROM leads WHERE id = ?', args: [leadId] });
  const row = result.rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;
  const stored = parse(row.consultation);
  const answers: Answers = { ...stored.answers };
  for (const [question, column] of PREFILL) {
    if (answers[question] === undefined && row[column]) answers[question] = String(row[column]);
  }
  return {
    leadId,
    name: String(row.name ?? ''),
    company: String(row.company ?? ''),
    status: String(row.status ?? ''),
    answers,
    updatedAt: stored.updatedAt,
    updatedBy: stored.updatedBy,
  };
}

export async function createConsultation(by: string): Promise<string> {
  const id = nanoid();
  await turso.execute({
    sql: `INSERT INTO leads (id, name, email, company, project_type, business_description, status, source, consultation, created_at, updated_at)
          VALUES (?, '', '', '', 'other', '', 'new', 'consultation', ?, unixepoch(), unixepoch())`,
    args: [id, JSON.stringify({ answers: {}, updatedAt: Date.now(), updatedBy: by })],
  });
  return id;
}

export async function saveConsultation(leadId: string, incoming: Answers, by: string): Promise<void> {
  // Only known questions, and only strings or lists of strings.
  const answers: Answers = {};
  for (const q of ALL_QUESTIONS) {
    const value = incoming[q.id];
    if (Array.isArray(value)) answers[q.id] = value.map((v) => String(v).slice(0, 300)).slice(0, 40);
    else if (typeof value === 'string') answers[q.id] = value.slice(0, 5000);
  }

  const column = (question: string) => answerText(answers[question]) || null;
  await turso.execute({
    sql: `UPDATE leads SET
            consultation = ?,
            name = COALESCE(?, name), company = COALESCE(?, company), phone = COALESCE(?, phone), email = COALESCE(?, email),
            ico = COALESCE(?, ico), business_description = COALESCE(?, business_description), industry = COALESCE(?, industry),
            existing_website = COALESCE(?, existing_website), project_goal = COALESCE(?, project_goal), project_reason = COALESCE(?, project_reason),
            usp = COALESCE(?, usp), top_competitors = COALESCE(?, top_competitors), customer_acquisition = COALESCE(?, customer_acquisition),
            budget_range = COALESCE(?, budget_range), timeline = COALESCE(?, timeline), additional_requirements = COALESCE(?, additional_requirements),
            updated_at = unixepoch()
          WHERE id = ?`,
    args: [
      JSON.stringify({ answers, updatedAt: Date.now(), updatedBy: by }),
      column('contactName'), column('company'), column('phone'), column('email'),
      column('ico'), column('about'), column('industry'),
      column('existingWebsite'), column('goal'), column('whyNow'),
      column('usp'), column('competitors'), column('acquisition'),
      column('budget'), column('launch'), column('custom'),
      leadId,
    ],
  });
}

/** Consultations already held, newest first, and recent enquiries that have not had one yet. */
export async function listConsultations() {
  const result = await turso.execute(
    `SELECT id, name, company, email, phone, source, status, consultation, created_at
       FROM leads WHERE COALESCE(source, '') != 'audit'
      ORDER BY (consultation IS NOT NULL) DESC, updated_at DESC LIMIT 80`
  );
  return result.rows.map((row) => {
    const stored = parse(row.consultation);
    const held = row.consultation !== null && Object.keys(stored.answers).length > 0;
    const p = progress(stored.answers);
    return {
      leadId: String(row.id),
      name: String(row.name ?? ''),
      company: String(row.company ?? ''),
      contact: [row.phone, row.email].filter(Boolean).join(' · '),
      held,
      started: row.consultation !== null,
      requiredDone: p.requiredDone,
      requiredTotal: p.requiredTotal,
      nextStep: answerText(stored.answers.nextStep),
      nextStepWhen: answerText(stored.answers.nextStepWhen),
      updatedAt: stored.updatedAt,
      updatedBy: stored.updatedBy,
    };
  });
}
