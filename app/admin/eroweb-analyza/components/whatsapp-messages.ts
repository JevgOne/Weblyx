/**
 * WhatsApp message templates for EroWeb analysis
 * Supports both Czech (CZ) and English (EN) versions
 */

export interface WhatsAppMessageParams {
  domain: string;
  businessType: string;
  businessTypeEn: string;
  score: number;
  analysisId: string;
  language: 'cs' | 'en' | 'de' | 'ru';
}

export function getWhatsAppMessage(params: WhatsAppMessageParams): string {
  const { domain, businessType, businessTypeEn, score, analysisId, language } = params;

  const lowScoreMessagesCz = [
    // Variation 1: AI search focus
    `Dobrý den,

jsem z Weblyx a specializujeme se na weby v oboru ${businessType}.

Při průzkumu trhu jsem narazil na Váš web *${domain}* a udělal jsem rychlou analýzu z pohledu moderních AI vyhledávačů.

V poslední době se hodně mění, jak klienti hledají služby - ChatGPT, Perplexity a další AI nástroje začínají nahrazovat klasický Google. Většina konkurence na to ale vůbec není připravená.

U Vašeho webu jsem našel několik věcí, které by mohly aktivně odrazovat potenciální klienty - hlavně z pohledu těch nových AI vyhledávačů. Kdybyste měli zájem, můžu Vám ukázat konkrétně co a proč to zákazníky odráží.

Máte chvilku na nezávaznou konzultaci?

S pozdravem,
Tým Weblyx
🌐 weblyx.cz`,

    // Variation 2: GEO/AIEO expertise focus
    `Dobrý den,

jsem z Weblyx a dělám analýzy webů pro ${businessType.toLowerCase()}.

Narazil jsem na Váš web *${domain}* a zajímalo mě, jak je připravený na nové AI vyhledávače.

Možná jste si všimli, že stále méně lidí používá klasický Google - místo toho se ptají ChatGPT nebo Perplexity. To vyžaduje úplně jinou optimalizaci než tradiční SEO. Říká se tomu GEO/AIEO a většina webů v tomto oboru to nemá vůbec nastavené.

Ve Vašem případě jsem našel pár kritických míst, která by stála o dost klientů. Můžu Vám poslat kompletní rozbor zdarma, kdyby Vás to zajímalo.

Máte chvilku si popovídat? 😊

S pozdravem,
Weblyx Team
🌐 weblyx.cz`,

    // Variation 3: Competitor angle
    `Ahoj,

jsem z Weblyx a dělám audity webů v oboru ${businessType.toLowerCase()}.

Při analýze konkurence jsem narazil na *${domain}* a všiml si pár věcí, které by mohly výrazně snižovat počet klientů z vyhledávání.

Dneska už nestačí jen klasické SEO - AI vyhledávače jako ChatGPT nebo Perplexity mění celou hru. Weby, které nejsou optimalizované pro tyto nástroje, prostě mizí z výsledků. A bohužel většina konkurence v tomto oboru na tom není o moc lépe.

Mám pro Vás konkrétní návrhy, co by se dalo vylepšit. Mohl bych Vám poslat detailní rozbor?

Dáte vědět, jestli by Vás to zajímalo?

Díky!
Tým Weblyx
🌐 weblyx.cz`
  ];

  const lowScoreMessagesEn = [
    // Variation 1: AI search focus
    `Hello,

I'm from Weblyx and we specialize in websites in the ${businessTypeEn} industry.

During market research, I came across your website *${domain}* and did a quick analysis from the perspective of modern AI search engines.

Recently, how clients search for services has been changing a lot - ChatGPT, Perplexity and other AI tools are starting to replace classic Google. However, most of the competition is not prepared for this at all.

On your website, I found several things that could actively discourage potential clients - especially from the perspective of these new AI search engines. If you're interested, I can show you specifically what and why it deters customers.

Do you have a moment for a free consultation?

Best regards,
Weblyx Team
🌐 weblyx.cz`,

    // Variation 2: GEO/AIEO expertise focus
    `Hello,

I'm from Weblyx and I do website analysis for ${businessTypeEn}.

I came across your website *${domain}* and was curious how it's prepared for new AI search engines.

You may have noticed that fewer and fewer people use classic Google - instead they ask ChatGPT or Perplexity. This requires completely different optimization than traditional SEO. It's called GEO/AIEO and most websites in this industry don't have it set up at all.

In your case, I found a few critical points that could cost you a lot of clients. I can send you a complete analysis for free if you're interested.

Do you have a moment to chat? 😊

Best regards,
Weblyx Team
🌐 weblyx.cz`,

    // Variation 3: Competitor angle
    `Hi,

I'm from Weblyx and I do website audits in the ${businessTypeEn} industry.

While analyzing the competition, I came across *${domain}* and noticed a few things that could significantly reduce the number of clients from search.

Today, classic SEO is no longer enough - AI search engines like ChatGPT or Perplexity are changing the whole game. Websites that are not optimized for these tools simply disappear from the results. And unfortunately, most of the competition in this industry is not much better off.

I have specific suggestions for you on what could be improved. Could I send you a detailed analysis?

Let me know if that would interest you?

Thanks!
Weblyx Team
🌐 weblyx.cz`
  ];

  const mediumScoreMessagesCz = [
    // Variation 1: Opportunity focus
    `Dobrý den,

jsem z Weblyx a specializujeme se na online marketing pro ${businessType.toLowerCase()}.

Při průzkumu trhu jsem narazil na Váš web *${domain}* a zaujal mě.

Web funguje, ale není připravený na nové AI vyhledávače (ChatGPT, Perplexity atd.). Což je vlastně dobrá zpráva - konkurence taky spí, takže teď je ideální moment se před ní dostat s GEO/AIEO optimalizací.

Vidím tam pár konkrétních příležitostí, jak přitáhnout víc zákazníků. Můžu Vám poslat kompletní rozbor zdarma.

Zajímalo by Vás to?

S pozdravem,
Tým Weblyx
🌐 weblyx.cz`,

    // Variation 2: Modernization angle
    `Dobrý den,

jsem z Weblyx a dělám analýzy webů v oboru ${businessType}.

Narazil jsem na *${domain}* a udělal jsem si na něm technickou analýzu.

Váš web je celkem slušný, ale chybí mu optimalizace pro AI nástroje - ChatGPT Search, Perplexity a podobně. To je dneska klíčové, protože stále víc lidí hledá služby přes tyto platformy místo Google.

Většina konkurence to taky nemá, takže kdo to udělá první, získá velkou výhodu. Mám pro Vás pár konkrétních nápadů.

Mohl bych Vám poslat detailní rozbor?

S pozdravem,
Weblyx
🌐 weblyx.cz`,

    // Variation 3: Direct value
    `Ahoj,

jsem z Weblyx a analyzuji weby v oboru ${businessType.toLowerCase()}.

Koukal jsem na *${domain}* a myslím, že bych Vám mohl pomoct získat víc klientů z vyhledávání.

S nástupem AI vyhledávačů (ChatGPT, Perplexity atd.) se hodně mění pravidla hry. Tradiční SEO už nestačí - potřebujete GEO/AIEO optimalizaci, kterou má zatím jen málokdo.

Udělal jsem Vám kompletní analýzu a mám tam pár dobrých nápadů. Můžu Vám to poslat?

Dáte vědět? 😊

Díky,
Tým Weblyx
🌐 weblyx.cz`
  ];

  const mediumScoreMessagesEn = [
    // Variation 1: Opportunity focus
    `Hello,

I'm from Weblyx and we specialize in online marketing for ${businessTypeEn}.

During market research, I came across your website *${domain}* and it caught my attention.

The website works, but it's not prepared for new AI search engines (ChatGPT, Perplexity, etc.). Which is actually good news - the competition is also sleeping, so now is the ideal moment to get ahead of them with GEO/AIEO optimization.

I see a few specific opportunities to attract more customers. I can send you a complete analysis for free.

Would you be interested?

Best regards,
Weblyx Team
🌐 weblyx.cz`,

    // Variation 2: Modernization angle
    `Hello,

I'm from Weblyx and I do website analysis in the ${businessTypeEn} industry.

I came across *${domain}* and did a technical analysis on it.

Your website is quite decent, but it lacks optimization for AI tools - ChatGPT Search, Perplexity and the like. This is crucial today, because more and more people are looking for services through these platforms instead of Google.

Most of the competition doesn't have this either, so whoever does it first will gain a big advantage. I have a few specific ideas for you.

Could I send you a detailed analysis?

Best regards,
Weblyx
🌐 weblyx.cz`,

    // Variation 3: Direct value
    `Hi,

I'm from Weblyx and I analyze websites in the ${businessTypeEn} industry.

I was looking at *${domain}* and I think I could help you get more clients from search.

With the rise of AI search engines (ChatGPT, Perplexity, etc.), the rules of the game are changing a lot. Traditional SEO is no longer enough - you need GEO/AIEO optimization, which only a few have so far.

I've done a complete analysis for you and I have some good ideas. Can I send it to you?

Let me know? 😊

Thanks,
Weblyx Team
🌐 weblyx.cz`
  ];

  const highScoreMessagesCz = [
    // Variation 1: Refinement focus
    `Dobrý den,

jsem z Weblyx a dělám pokročilé analýzy webů pro ${businessType.toLowerCase()}.

Narazil jsem na Váš web *${domain}* a musím říct, že je nad průměrem.

I přesto jsem našel pár míst, kde by lepší GEO optimalizace pro AI vyhledávače mohla výrazně zvýšit konverze. S nástupem ChatGPT Search a Perplexity se pravidla mění a málokt o to zatím stojí.

Kdyby Vás zajímaly detaily, můžu Vám poslat kompletní rozbor.

Máte zájem?

S pozdravem,
Tým Weblyx
🌐 weblyx.cz`,

    // Variation 2: Competitive edge
    `Dobrý den,

jsem z Weblyx a specializujeme se na optimalizaci webů v oboru ${businessType}.

Při analýze trhu jsem narazil na *${domain}* - Váš web je určitě mezi lepšími.

Přesto jsem identifikoval několik drobností, které by mohly posunout Vaši viditelnost v AI vyhledávačích (ChatGPT, Perplexity) ještě výš. Většina konkurence tyto nástroje ignoruje, což je pro Vás příležitost.

Mohl bych Vám poslat detailní analýzu s konkrétními doporučeními?

Dáte vědět? 😊

S pozdravem,
Weblyx Team
🌐 weblyx.cz`,

    // Variation 3: Future-proofing
    `Ahoj,

jsem z Weblyx a dělám audity webů pro ${businessType.toLowerCase()}.

Koukal jsem na *${domain}* a líbí se mi, jak je web udělán.

I tak jsem našel pár věcí, které by ho mohly ještě vyladit pro budoucnost - hlavně kvůli AI vyhledávačům jako ChatGPT nebo Perplexity, které postupně nahrazují klasický Google. GEO/AIEO optimalizace je dneska klíč.

Mám pro Vás pár konkrétních návrhů. Zajímal by Vás detailní rozbor?

Díky!
Tým Weblyx
🌐 weblyx.cz`
  ];

  const highScoreMessagesEn = [
    // Variation 1: Refinement focus
    `Hello,

I'm from Weblyx and I do advanced website analysis for ${businessTypeEn}.

I came across your website *${domain}* and I must say it's above average.

Even so, I found a few places where better GEO optimization for AI search engines could significantly increase conversions. With the rise of ChatGPT Search and Perplexity, the rules are changing and few people care about it yet.

If you're interested in the details, I can send you a complete analysis.

Are you interested?

Best regards,
Weblyx Team
🌐 weblyx.cz`,

    // Variation 2: Competitive edge
    `Hello,

I'm from Weblyx and we specialize in website optimization in the ${businessTypeEn} industry.

During market analysis, I came across *${domain}* - your website is definitely among the better ones.

Nevertheless, I identified several small things that could push your visibility in AI search engines (ChatGPT, Perplexity) even higher. Most of the competition ignores these tools, which is an opportunity for you.

Could I send you a detailed analysis with specific recommendations?

Let me know? 😊

Best regards,
Weblyx Team
🌐 weblyx.cz`,

    // Variation 3: Future-proofing
    `Hi,

I'm from Weblyx and I do website audits for ${businessTypeEn}.

I was looking at *${domain}* and I like how the website is made.

Even so, I found a few things that could fine-tune it for the future - mainly because of AI search engines like ChatGPT or Perplexity, which are gradually replacing classic Google. GEO/AIEO optimization is key today.

I have a few specific suggestions for you. Would you be interested in a detailed analysis?

Thanks!
Weblyx Team
🌐 weblyx.cz`
  ];

  // German low score messages
  const lowScoreMessagesDe = [
    `Guten Tag,

ich bin von Weblyx und wir spezialisieren uns auf Websites in der ${businessTypeEn}-Branche.

Bei der Marktforschung bin ich auf Ihre Website *${domain}* gestoßen und habe eine schnelle Analyse aus der Perspektive moderner KI-Suchmaschinen durchgeführt.

In letzter Zeit verändert sich viel, wie Kunden Dienstleistungen suchen - ChatGPT, Perplexity und andere KI-Tools beginnen das klassische Google zu ersetzen. Der Großteil der Konkurrenz ist darauf jedoch überhaupt nicht vorbereitet.

Auf Ihrer Website habe ich mehrere Dinge gefunden, die potenzielle Kunden aktiv abschrecken könnten. Wenn Sie interessiert sind, kann ich Ihnen genau zeigen, was und warum es Kunden abschreckt.

Haben Sie einen Moment für eine unverbindliche Beratung?

Mit freundlichen Grüßen,
Weblyx Team
🌐 weblyx.cz`,
  ];

  const mediumScoreMessagesDe = [
    `Guten Tag,

ich bin von Weblyx und wir spezialisieren uns auf Online-Marketing für ${businessTypeEn}.

Bei der Marktforschung bin ich auf Ihre Website *${domain}* gestoßen und sie hat meine Aufmerksamkeit erregt.

Die Website funktioniert, ist aber nicht auf neue KI-Suchmaschinen (ChatGPT, Perplexity usw.) vorbereitet. Was eigentlich eine gute Nachricht ist - die Konkurrenz schläft auch, also ist jetzt der ideale Moment, sich mit GEO/AIEO-Optimierung vor ihnen zu positionieren.

Ich sehe einige spezifische Möglichkeiten, mehr Kunden anzuziehen. Ich kann Ihnen eine vollständige Analyse kostenlos zusenden.

Wären Sie interessiert?

Mit freundlichen Grüßen,
Weblyx Team
🌐 weblyx.cz`,
  ];

  const highScoreMessagesDe = [
    `Guten Tag,

ich bin von Weblyx und führe fortgeschrittene Website-Analysen für ${businessTypeEn} durch.

Ich bin auf Ihre Website *${domain}* gestoßen und muss sagen, sie ist überdurchschnittlich.

Trotzdem habe ich ein paar Stellen gefunden, an denen eine bessere GEO-Optimierung für KI-Suchmaschinen die Konversionen deutlich steigern könnte. Mit dem Aufkommen von ChatGPT Search und Perplexity ändern sich die Regeln und nur wenige kümmern sich bisher darum.

Wenn Sie an den Details interessiert sind, kann ich Ihnen eine vollständige Analyse zusenden.

Sind Sie interessiert?

Mit freundlichen Grüßen,
Weblyx Team
🌐 weblyx.cz`,
  ];

  // Russian low score messages
  const lowScoreMessagesRu = [
    `Добрый день,

я из Weblyx, мы специализируемся на сайтах в индустрии ${businessTypeEn}.

При исследовании рынка я наткнулся на ваш сайт *${domain}* и провел быстрый анализ с точки зрения современных AI-поисковиков.

В последнее время многое меняется в том, как клиенты ищут услуги - ChatGPT, Perplexity и другие AI-инструменты начинают заменять классический Google. Однако большинство конкурентов к этому совершенно не готовы.

На вашем сайте я нашел несколько вещей, которые могут активно отпугивать потенциальных клиентов. Если вам интересно, я могу показать конкретно что и почему это отпугивает клиентов.

Есть ли у вас время на бесплатную консультацию?

С уважением,
Команда Weblyx
🌐 weblyx.cz`,
  ];

  const mediumScoreMessagesRu = [
    `Добрый день,

я из Weblyx, мы специализируемся на онлайн-маркетинге для ${businessTypeEn}.

При исследовании рынка я наткнулся на ваш сайт *${domain}*, и он привлек мое внимание.

Сайт работает, но не готов к новым AI-поисковикам (ChatGPT, Perplexity и т.д.). Что на самом деле хорошая новость - конкуренты тоже спят, так что сейчас идеальный момент опередить их с GEO/AIEO оптимизацией.

Я вижу несколько конкретных возможностей привлечь больше клиентов. Могу бесплатно отправить вам полный анализ.

Вам было бы интересно?

С уважением,
Команда Weblyx
🌐 weblyx.cz`,
  ];

  const highScoreMessagesRu = [
    `Добрый день,

я из Weblyx, занимаюсь продвинутым анализом сайтов для ${businessTypeEn}.

Я наткнулся на ваш сайт *${domain}* и должен сказать, что он выше среднего.

Тем не менее, я нашел несколько мест, где лучшая GEO-оптимизация для AI-поисковиков могла бы значительно увеличить конверсии. С появлением ChatGPT Search и Perplexity правила меняются, и мало кто пока обращает на это внимание.

Если вам интересны детали, я могу отправить вам полный анализ.

Заинтересованы?

С уважением,
Команда Weblyx
🌐 weblyx.cz`,
  ];

  // Select variation based on score and language
  let variations;
  if (score < 50) {
    if (language === 'cs') variations = lowScoreMessagesCz;
    else if (language === 'de') variations = lowScoreMessagesDe;
    else if (language === 'ru') variations = lowScoreMessagesRu;
    else variations = lowScoreMessagesEn;
  } else if (score < 70) {
    if (language === 'cs') variations = mediumScoreMessagesCz;
    else if (language === 'de') variations = mediumScoreMessagesDe;
    else if (language === 'ru') variations = mediumScoreMessagesRu;
    else variations = mediumScoreMessagesEn;
  } else {
    if (language === 'cs') variations = highScoreMessagesCz;
    else if (language === 'de') variations = highScoreMessagesDe;
    else if (language === 'ru') variations = highScoreMessagesRu;
    else variations = highScoreMessagesEn;
  }

  // Use analysis ID as seed for consistent randomization per analysis
  const seed = analysisId ? parseInt(analysisId.split('_')[1] || '0', 10) : 0;
  const index = seed % variations.length;

  return variations[index];
}
