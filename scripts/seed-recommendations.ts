import { turso } from "../lib/turso";
import { v4 as uuidv4 } from "uuid";

const sampleRecommendations = [
  {
    platform: "google_ads",
    type: "keyword",
    priority: "critical",
    title: "Pausni keyword 'wordpress zdarma'",
    description:
      "45 kliků, 0 konverzí, CPC 12 Kč. Irelevantní traffic - uživatelé hledají free řešení.",
    expected_impact: "Úspora ~540 Kč/měsíc, snížení CPA",
  },
  {
    platform: "meta_ads",
    type: "creative",
    priority: "high",
    title: "Creative fatigue - Video_UGC_A",
    description:
      "Frequency 4.2, CTR klesla o 35% za poslední týden. Kreativa je přeexponovaná.",
    expected_impact: "Refresh může zvýšit CTR o 20-40%",
  },
  {
    platform: "google_ads",
    type: "budget",
    priority: "medium",
    title: "Scale Brand kampaň +20%",
    description:
      "ROAS 8.5x stabilně 7 dní, Impression Share 78%. Prostor pro růst.",
    expected_impact: "Potenciálně +15% konverzí při zachování ROAS",
  },
  {
    platform: "meta_ads",
    type: "audience",
    priority: "high",
    title: "Vytvoř Lookalike z purchasers",
    description:
      "Máš 127 nákupů za 30 dní. Dost dat pro kvalitní 1% LAL audience.",
    expected_impact: "LAL audiences mají o 50% nižší CPA než interest targeting",
  },
  {
    platform: "google_ads",
    type: "negative",
    priority: "medium",
    title: "Přidej negative keywords",
    description:
      "Search terms obsahují 'recenze', 'porovnání', 'alternativy' - informační intent bez konverzí.",
    expected_impact: "Snížení wasted spend o 10-15%",
  },
];

async function seed() {
  console.log("Starting seed...");

  for (const rec of sampleRecommendations) {
    const id = uuidv4();
    try {
      await turso.execute({
        sql: `INSERT INTO marketing_recommendations
         (id, platform, type, priority, title, description, expected_impact, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        args: [
          id,
          rec.platform,
          rec.type,
          rec.priority,
          rec.title,
          rec.description,
          rec.expected_impact,
        ],
      });
      console.log(`✅ Added: ${rec.title}`);
    } catch (e: any) {
      console.error(`❌ Failed: ${rec.title}`, e.message);
    }
  }

  console.log(`\nSeeded ${sampleRecommendations.length} recommendations`);
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
