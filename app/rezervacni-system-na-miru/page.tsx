import type { Metadata } from "next";
import { CustomFeatureLanding, type CustomFeatureContent } from "@/components/landing/CustomFeatureLanding";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Rezervační systém na míru s Telegram botem",
  description:
    "Rezervační systém přímo na vašem webu: výběr termínu, online platba, poukazy, administrace a Telegram bot pro rezervace. Cena podle rozsahu.",
  alternates: { canonical: "https://www.weblyx.cz/rezervacni-system-na-miru" },
};

const CONTENT: CustomFeatureContent = {
  path: "/rezervacni-system-na-miru",
  label: "Rezervační systém na míru",
  /** Bumped when the page is edited, not on every build. */
  lastUpdated: "2026-10-06",
  h1: "Rezervační systém na míru, přímo na vašem webu",
  lead:
    "Zákazník si vybere termín, zaplatí a dostane potvrzení. Vy máte rezervace, platby i poukazy v jedné administraci. Níže je, co v dodaných systémech opravdu běží, včetně rezervací přes Telegram.",
  schemaDescription:
    "Rezervační systém na míru: výběr termínu, online platba, dárkové poukazy a administrace rezervací.",
  why: {
    heading: "Kdy se vyplatí rezervační systém na míru?",
    paragraphs: [
      "Hotové rezervační služby fungují dobře, dokud prodáváte jednoduché termíny. Když máte vlastní balíčky, poukazy nebo pravidla, kdy je volno, začnete je ohýbat a zákazník to pozná.",
      "Systém na míru běží na vaší doméně a ve vašem designu. Zákazník neodchází na cizí stránku a vy rozhodujete, jak rezervace probíhá.",
    ],
  },
  groups: [
    {
      title: "Co vidí zákazník při rezervaci?",
      items: [
        "Výběr balíčku nebo služby, data a času",
        "Jen termíny, které jsou opravdu volné",
        "Stránku se stavem rezervace po odeslání",
        "Potvrzení e-mailem po zaplacení",
      ],
    },
    {
      title: "Jak funguje online platba?",
      items: [
        "Platba kartou přes platební bránu hned při rezervaci",
        "Potvrzení odchází až po přijetí platby",
        "Vrácení peněz z administrace, celé částky nebo její části",
      ],
    },
    {
      id: "poukazy",
      title: "Jak fungují dárkové poukazy s QR kódem?",
      items: [
        "Poukaz se dá koupit online, na částku nebo na konkrétní službu",
        "Přijde e-mailem i s QR kódem",
        "Uplatní se při rezervaci; když pokryje celou cenu, platba se přeskočí",
        "Na místě ho personál otevře přes QR kód a uplatní; dvakrát použít nejde",
        "V administraci vidíte, který poukaz je platný, uplatněný nebo propadlý",
      ],
    },
    {
      title: "Jak se hlídá dostupnost termínů?",
      items: [
        "Týdenní rozvrh, kdy přijímáte rezervace",
        "Jednotlivé termíny přidané navíc mimo rozvrh",
        "Kontrola na serveru, aby jeden termín nezískali dva lidé",
        "Zrušená rezervace termín hned uvolní",
      ],
    },
    {
      id: "telegram-bot",
      title: "Co umí Telegram bot?",
      intro:
        "Zákazník napíše botovi běžnou větou, kdy by chtěl přijít. Bot mu odpoví, nabídne volné časy a rezervaci s ním dokončí.",
      items: [
        "Rozumí běžně psaným zprávám, ne jen příkazům",
        "Ukáže volné termíny a ceník",
        "Rezervace na tlačítka: čas, délka, shrnutí a potvrzení",
        "Zákazník si zobrazí své rezervace a může je zrušit",
        "Personálu přijde nová rezervace rovnou do Telegramu",
        "Ochrana proti spamu a zahlcení zprávami",
      ],
    },
    {
      title: "Co máte v administraci?",
      items: [
        "Přehled rezervací s detailem, stavem a vlastními poznámkami",
        "Správu balíčků, poukazů a rozvrhu",
        "E-mail při nové rezervaci a při přijaté platbě",
        "Galerii, recenze a příchozí dotazy ve stejném panelu",
      ],
    },
  ],
  closing:
    "Potřebujete něco, co tu není? Popište nám, jak rezervace probíhají u vás, a navrhneme, co má systém umět.",
  formHeading: "Chci probrat rezervační systém",
  faq: [
    {
      question: "Kolik stojí rezervační systém na míru?",
      answer:
        "Cena se řídí rozsahem, tedy tím, jestli chcete online platbu, poukazy a jak složitá jsou pravidla dostupnosti. Po úvodním hovoru dostanete seznam funkcí a pevnou cenu za ně.",
    },
    {
      question: "Může zákazník zaplatit rovnou při rezervaci?",
      answer:
        "Ano. V dodaném systému platí zákazník kartou přes platební bránu a potvrzení dostane e-mailem až po přijetí platby. Peníze jdou z administrace vrátit, celé i částečně.",
    },
    {
      question: "Umí systém dárkové poukazy?",
      answer:
        "Ano. Poukaz se dá koupit online a přijde e-mailem i s QR kódem. Uplatní se při rezervaci nebo na místě přes QR kód a dvakrát ho použít nejde.",
    },
    {
      question: "Může se stát, že si dva lidé zarezervují stejný termín?",
      answer:
        "Ne. Dostupnost se kontroluje na serveru v okamžiku odeslání rezervace, takže druhý zájemce dostane zprávu, že termín už není volný.",
    },
    {
      question: "Jak funguje rezervace přes Telegram?",
      answer:
        "Zákazník napíše botovi běžnou zprávu. Bot ukáže volné termíny, nabídne časy a délky jako tlačítka a po potvrzení rezervaci založí. Personálu přijde upozornění do Telegramu a zákazník si může rezervaci v botovi i zrušit.",
    },
    {
      question: "Co když potřebuji funkci, kterou tu nevidím?",
      answer:
        "Napište nám ji. Systém stavíme podle vašeho provozu, takže seznam funkcí vzniká z úvodního hovoru, ne z hotového balíčku.",
    },
  ],
};

export default function RezervacniSystemNaMiruPage() {
  return <CustomFeatureLanding content={CONTENT} />;
}
