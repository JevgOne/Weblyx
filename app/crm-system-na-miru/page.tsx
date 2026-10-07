import type { Metadata } from "next";
import { CustomFeatureLanding, type CustomFeatureContent } from "@/components/landing/CustomFeatureLanding";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "CRM systém na míru pro obchodní tým",
  description:
    "CRM postavené podle toho, jak váš tým pracuje: karta klienta, pipeline, role, volání, e-maily, PDF smlouvy a interní požadavky. Cena podle rozsahu.",
  alternates: { canonical: "https://www.weblyx.cz/crm-system-na-miru" },
};

const CONTENT: CustomFeatureContent = {
  path: "/crm-system-na-miru",
  label: "CRM systém na míru",
  /** Bumped when the page is edited, not on every build. */
  lastUpdated: "2026-10-06",
  h1: "CRM systém na míru, postavený podle vašeho obchodu",
  lead:
    "Nestavíme jen weby. Pro klienty z financí jsme dodali CRM, ve kterém obchodní tým vede klienty od prvního hovoru po smlouvu. Níže je, co v něm opravdu běží.",
  schemaDescription:
    "CRM systém na míru: karta klienta, pipeline, role, režim volání, e-maily, PDF smlouvy a interní požadavky.",
  why: {
    heading: "Kdy se vyplatí CRM na míru místo hotového?",
    paragraphs: [
      "Hotové CRM je dobrá volba, dokud se váš obchod vejde do jeho kolonek. Jakmile máte vlastní fáze obchodu, vlastní dokumenty nebo pravidla, kdo smí co vidět, začnete ho obcházet tabulkami a e-maily.",
      "CRM na míru má jen to, co používáte, pojmenované tak, jak tomu říkáte vy. Fáze, role, šablony i výstupy se staví podle vašeho procesu, ne naopak.",
    ],
  },
  groups: [
    {
      title: "Co systém eviduje o klientech a obchodech?",
      items: [
        "Karta klienta s přehledem, historií, platbami, dokumenty, e-maily a požadavky na jednom místě",
        "Pipeline jako nástěnka s fázemi, včetně hromadné změny fáze",
        "Skórování leadů, aby bylo vidět, komu volat dřív",
        "Automatické denní rozdělení nových leadů mezi obchodníky",
        "Export do CSV; úvodní import vašich kontaktů uděláme my",
      ],
    },
    {
      title: "Jak v něm pracuje tým?",
      items: [
        "Tři role: administrátor, supervizor a obchodník, každá vidí jen svá data",
        "Záznam o tom, kdo co v systému změnil",
        "Režim volání: další klient, tlačítka s výsledkem hovoru, historie hovorů",
        "Kalendář událostí a přehled „můj den“",
        "Přehledy s obchodním trychtýřem, grafy a pořadím obchodníků",
      ],
    },
    {
      title: "Co umí s e-maily a dokumenty?",
      items: [
        "Odesílání e-mailů přímo ze systému, se šablonami a odhlášením z odběru",
        "Odpovědi klientů se načítají ze schránky a ukládají ke kartě klienta",
        "Smlouvy a nabídky generované do PDF",
        "Přehled plateb a automatická připomenutí termínů",
        "Na telefonu funguje jako aplikace, kterou si přidáte na plochu",
      ],
    },
    {
      id: "interni-komunikace",
      title: "Jak funguje interní komunikace?",
      intro:
        "Není to volný chat. Je to systém požadavků, kde má každý požadavek vlastní diskusní vlákno, takže se domluva neztratí mezi zprávami.",
      items: [
        "Požadavek má název, prioritu ve čtyřech stupních, stav a řešitele",
        "Pod požadavkem je vlákno odpovědí s autorem a časem",
        "Požadavek jde navázat na kartu klienta a je vidět přímo u něj",
        "Upozornění v aplikaci na přiřazení, novou odpověď a vyřešení",
        "Supervizor vidí všechny požadavky a může je přiřadit jinému kolegovi",
      ],
    },
  ],
  closing:
    "Potřebujete něco, co tu není? Tyhle funkce vznikly podle zadání konkrétních klientů. U vás začneme tím, jak pracujete, a navrhneme, co má systém umět.",
  formHeading: "Chci probrat CRM na míru",
  faq: [
    {
      question: "Kolik stojí CRM systém na míru?",
      answer:
        "Cena se řídí rozsahem, tedy počtem funkcí a rolí a tím, na co se má systém napojit. Po úvodním hovoru dostanete seznam funkcí a pevnou cenu za ně.",
    },
    {
      question: "Pro koho jste CRM stavěli?",
      answer:
        "Pro klienty z financí, jejichž obchodní týmy v něm vedou klienty od prvního kontaktu po smlouvu. Klienty nejmenujeme, funkce uvedené na této stránce jsou ale ty, které v dodaných systémech běží.",
    },
    {
      question: "Je interní komunikace v CRM chat?",
      answer:
        "Ne. Jde o systém požadavků s diskusním vláknem u každého z nich. Požadavek má řešitele, prioritu a stav a jde navázat na kartu klienta. Upozornění přicházejí v aplikaci.",
    },
    {
      question: "Dá se CRM používat na telefonu?",
      answer:
        "Ano. Systém se dá přidat na plochu telefonu jako aplikace a seznam klientů má na malé obrazovce podobu karet.",
    },
    {
      question: "Co když potřebuji funkci, kterou tu nevidím?",
      answer:
        "Napište nám ji. Systém stavíme podle vašeho procesu, takže seznam funkcí vzniká z úvodního hovoru, ne z hotového balíčku.",
    },
  ],
};

export default function CrmSystemNaMiruPage() {
  return <CustomFeatureLanding content={CONTENT} />;
}
