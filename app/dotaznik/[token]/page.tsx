import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CLIENT_QUESTIONS, optionsOf } from "@/lib/consultation/questions";
import { getConsultationByToken, getOfferOptions } from "@/lib/consultation/store";
import { ClientQuestionnaire } from "@/components/consultation/ClientQuestionnaire";

export const dynamic = "force-dynamic";

// Private to whoever holds the link: never indexed, never followed.
export const metadata: Metadata = {
  title: "Dotazník k novému webu | Weblyx",
  robots: { index: false, follow: false },
};

export default async function QuestionnairePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const consultation = await getConsultationByToken(token);
  if (!consultation) notFound();

  const offer = await getOfferOptions();
  // Contact details the enquiry already holds are not asked again.
  const known = new Set(
    ["contactName", "company", "phone", "email"].filter((id) => {
      const value = consultation.answers[id];
      return typeof value === "string" && value.trim();
    })
  );
  const questions = CLIENT_QUESTIONS.filter((q) => !known.has(q.id)).map((q) => ({
    id: q.id,
    text: q.client!,
    type: q.type,
    options: optionsOf(q, offer),
  }));
  const initial = Object.fromEntries(CLIENT_QUESTIONS.map((q) => [q.id, consultation.answers[q.id] ?? (q.type === "multi" ? [] : "")]));

  return (
    <main className="mx-auto w-full max-w-[720px] px-5 pb-24 pt-32">
      <p className="text-[13px] font-bold uppercase tracking-[.08em] text-teal-700">Weblyx</p>
      <h1 className="mt-2 text-[34px] font-extrabold leading-tight tracking-tight text-slate-900">
        Pár otázek k vašemu novému webu
      </h1>
      <p className="mt-3 text-[16px] leading-relaxed text-slate-600">
        Zabere to asi pět minut. Podle odpovědí vám připravíme nabídku na míru. Vzhled, barvy a detaily
        spolu probereme na konzultaci, tady je řešit nemusíte.
      </p>
      <ClientQuestionnaire token={token} questions={questions} initial={initial} />
    </main>
  );
}
