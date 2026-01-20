// EroWeb Finding Translations - CS/EN/DE/RU
// All finding text in all supported languages

export type FindingLocale = 'cs' | 'en' | 'de' | 'ru';

interface FindingText {
  title: string;
  description: string;
  impact: string;
}

type FindingTranslations = Record<FindingLocale, FindingText>;

// Speed findings
export const SPEED_FINDINGS = {
  lcp_critical: {
    cs: {
      title: 'Web se načítá přes 6 sekund',
      description: (lcp: number) => `Největší obsahový prvek (LCP) se načítá ${(lcp / 1000).toFixed(1)} sekund. Google doporučuje pod 2.5 sekundy.`,
      impact: '53% návštěvníků odejde před načtením stránky',
    },
    en: {
      title: 'Website loads over 6 seconds',
      description: (lcp: number) => `Largest Contentful Paint (LCP) loads in ${(lcp / 1000).toFixed(1)} seconds. Google recommends under 2.5 seconds.`,
      impact: '53% of visitors leave before the page loads',
    },
    de: {
      title: 'Website lädt über 6 Sekunden',
      description: (lcp: number) => `Largest Contentful Paint (LCP) lädt in ${(lcp / 1000).toFixed(1)} Sekunden. Google empfiehlt unter 2,5 Sekunden.`,
      impact: '53% der Besucher verlassen die Seite vor dem Laden',
    },
    ru: {
      title: 'Сайт загружается более 6 секунд',
      description: (lcp: number) => `Largest Contentful Paint (LCP) загружается ${(lcp / 1000).toFixed(1)} секунд. Google рекомендует менее 2.5 секунд.`,
      impact: '53% посетителей уходят до загрузки страницы',
    },
  },
  lcp_warning: {
    cs: {
      title: 'Pomalé načítání hlavního obsahu',
      description: (lcp: number) => `LCP je ${(lcp / 1000).toFixed(1)} sekund. Optimální je pod 2.5 sekundy.`,
      impact: 'Pomalé načítání snižuje konverze o 20-30%',
    },
    en: {
      title: 'Slow main content loading',
      description: (lcp: number) => `LCP is ${(lcp / 1000).toFixed(1)} seconds. Optimal is under 2.5 seconds.`,
      impact: 'Slow loading reduces conversions by 20-30%',
    },
    de: {
      title: 'Langsames Laden des Hauptinhalts',
      description: (lcp: number) => `LCP beträgt ${(lcp / 1000).toFixed(1)} Sekunden. Optimal sind unter 2,5 Sekunden.`,
      impact: 'Langsames Laden reduziert Konversionen um 20-30%',
    },
    ru: {
      title: 'Медленная загрузка основного контента',
      description: (lcp: number) => `LCP составляет ${(lcp / 1000).toFixed(1)} секунд. Оптимально — менее 2.5 секунд.`,
      impact: 'Медленная загрузка снижает конверсию на 20-30%',
    },
  },
  ttfb_slow: {
    cs: {
      title: 'Pomalá odezva serveru',
      description: (ttfb: number) => `Server odpovídá za ${(ttfb / 1000).toFixed(1)} sekund (TTFB). Doporučeno pod 0.8 sekundy.`,
      impact: 'Může signalizovat přetížený nebo špatně nakonfigurovaný hosting',
    },
    en: {
      title: 'Slow server response',
      description: (ttfb: number) => `Server responds in ${(ttfb / 1000).toFixed(1)} seconds (TTFB). Recommended under 0.8 seconds.`,
      impact: 'May indicate overloaded or misconfigured hosting',
    },
    de: {
      title: 'Langsame Server-Antwort',
      description: (ttfb: number) => `Server antwortet in ${(ttfb / 1000).toFixed(1)} Sekunden (TTFB). Empfohlen unter 0,8 Sekunden.`,
      impact: 'Kann auf überlastetes oder falsch konfiguriertes Hosting hinweisen',
    },
    ru: {
      title: 'Медленный ответ сервера',
      description: (ttfb: number) => `Сервер отвечает за ${(ttfb / 1000).toFixed(1)} секунд (TTFB). Рекомендуется менее 0.8 секунды.`,
      impact: 'Может указывать на перегруженный или неправильно настроенный хостинг',
    },
  },
  pagespeed_critical: {
    cs: {
      title: (score: number) => `Google PageSpeed skóre pouze ${score}/100`,
      description: 'Nízké skóre negativně ovlivňuje pozice ve vyhledávání a uživatelskou zkušenost.',
      impact: 'Google upřednostňuje rychlé weby v mobilním vyhledávání',
    },
    en: {
      title: (score: number) => `Google PageSpeed score only ${score}/100`,
      description: 'Low score negatively affects search rankings and user experience.',
      impact: 'Google prioritizes fast websites in mobile search',
    },
    de: {
      title: (score: number) => `Google PageSpeed-Score nur ${score}/100`,
      description: 'Niedriger Score beeinflusst Suchranking und Benutzererfahrung negativ.',
      impact: 'Google bevorzugt schnelle Websites in der mobilen Suche',
    },
    ru: {
      title: (score: number) => `Google PageSpeed только ${score}/100`,
      description: 'Низкий балл негативно влияет на позиции в поиске и пользовательский опыт.',
      impact: 'Google отдает предпочтение быстрым сайтам в мобильном поиске',
    },
  },
  pagespeed_warning: {
    cs: {
      title: (score: number) => `PageSpeed skóre ${score}/100 - prostor pro zlepšení`,
      description: 'Optimalizací obrázků a kódu lze dosáhnout skóre 90+.',
      impact: 'Rychlejší web = více konverzí',
    },
    en: {
      title: (score: number) => `PageSpeed score ${score}/100 - room for improvement`,
      description: 'Optimizing images and code can achieve 90+ score.',
      impact: 'Faster website = more conversions',
    },
    de: {
      title: (score: number) => `PageSpeed-Score ${score}/100 - Verbesserungspotenzial`,
      description: 'Durch Optimierung von Bildern und Code kann ein Score von 90+ erreicht werden.',
      impact: 'Schnellere Website = mehr Konversionen',
    },
    ru: {
      title: (score: number) => `PageSpeed ${score}/100 - есть что улучшить`,
      description: 'Оптимизация изображений и кода позволит достичь 90+ баллов.',
      impact: 'Быстрее сайт = больше конверсий',
    },
  },
};

// Mobile findings
export const MOBILE_FINDINGS = {
  no_viewport: {
    cs: {
      title: 'Web není optimalizován pro mobily',
      description: 'Chybí viewport meta tag - web se na mobilech zobrazuje jako desktop verze.',
      impact: '70%+ návštěvníků přichází z mobilních zařízení',
    },
    en: {
      title: 'Website not optimized for mobile',
      description: 'Missing viewport meta tag - website displays as desktop version on mobile.',
      impact: '70%+ of visitors come from mobile devices',
    },
    de: {
      title: 'Website nicht für Mobilgeräte optimiert',
      description: 'Fehlender Viewport-Meta-Tag - Website wird auf Mobilgeräten als Desktop-Version angezeigt.',
      impact: '70%+ der Besucher kommen von Mobilgeräten',
    },
    ru: {
      title: 'Сайт не оптимизирован для мобильных',
      description: 'Отсутствует viewport meta tag - сайт отображается как десктоп-версия на мобильных.',
      impact: '70%+ посетителей приходят с мобильных устройств',
    },
  },
  horizontal_scroll: {
    cs: {
      title: 'Horizontální scrollování na mobilu',
      description: 'Některé prvky přesahují šířku obrazovky, což zhoršuje použitelnost.',
      impact: 'Frustruje uživatele a snižuje čas strávený na webu',
    },
    en: {
      title: 'Horizontal scrolling on mobile',
      description: 'Some elements exceed screen width, which worsens usability.',
      impact: 'Frustrates users and reduces time spent on site',
    },
    de: {
      title: 'Horizontales Scrollen auf Mobilgeräten',
      description: 'Einige Elemente überschreiten die Bildschirmbreite, was die Benutzerfreundlichkeit verschlechtert.',
      impact: 'Frustriert Benutzer und verringert die Verweildauer',
    },
    ru: {
      title: 'Горизонтальная прокрутка на мобильных',
      description: 'Некоторые элементы выходят за ширину экрана, что ухудшает удобство использования.',
      impact: 'Раздражает пользователей и снижает время на сайте',
    },
  },
  small_touch_targets: {
    cs: {
      title: 'Tlačítka jsou příliš malá pro dotyk',
      description: 'Interaktivní prvky mají méně než 48px, což ztěžuje ovládání na mobilu.',
      impact: 'Uživatelé mohou kliknout na špatný odkaz',
    },
    en: {
      title: 'Buttons too small for touch',
      description: 'Interactive elements are smaller than 48px, making mobile navigation difficult.',
      impact: 'Users may tap the wrong link',
    },
    de: {
      title: 'Buttons zu klein für Touch',
      description: 'Interaktive Elemente sind kleiner als 48px, was die mobile Navigation erschwert.',
      impact: 'Benutzer können den falschen Link antippen',
    },
    ru: {
      title: 'Кнопки слишком маленькие для касания',
      description: 'Интерактивные элементы меньше 48px, что затрудняет навигацию на мобильных.',
      impact: 'Пользователи могут нажать не ту ссылку',
    },
  },
  text_not_readable: {
    cs: {
      title: 'Text je na mobilu špatně čitelný',
      description: 'Font je příliš malý nebo má špatný kontrast.',
      impact: 'Nutí uživatele přibližovat, což zhoršuje UX',
    },
    en: {
      title: 'Text hard to read on mobile',
      description: 'Font is too small or has poor contrast.',
      impact: 'Forces users to zoom in, worsening UX',
    },
    de: {
      title: 'Text auf Mobilgeräten schwer lesbar',
      description: 'Schrift ist zu klein oder hat schlechten Kontrast.',
      impact: 'Zwingt Benutzer zum Zoomen, was die UX verschlechtert',
    },
    ru: {
      title: 'Текст плохо читается на мобильных',
      description: 'Шрифт слишком мелкий или имеет плохой контраст.',
      impact: 'Заставляет пользователей приближать, что ухудшает UX',
    },
  },
};

// Security findings
export const SECURITY_FINDINGS = {
  no_https: {
    cs: {
      title: 'Web nemá HTTPS zabezpečení',
      description: 'Prohlížeče označují web jako "Nezabezpečený" - odrazuje zákazníky.',
      impact: 'Ztráta důvěry a negativní vliv na SEO',
    },
    en: {
      title: 'Website lacks HTTPS security',
      description: 'Browsers mark the site as "Not Secure" - discourages customers.',
      impact: 'Loss of trust and negative SEO impact',
    },
    de: {
      title: 'Website hat keine HTTPS-Sicherheit',
      description: 'Browser kennzeichnen die Website als "Nicht sicher" - schreckt Kunden ab.',
      impact: 'Vertrauensverlust und negative SEO-Auswirkungen',
    },
    ru: {
      title: 'Сайт не имеет HTTPS',
      description: 'Браузеры помечают сайт как "Небезопасный" - отпугивает клиентов.',
      impact: 'Потеря доверия и негативное влияние на SEO',
    },
  },
  mixed_content: {
    cs: {
      title: 'Smíšený obsah (HTTP na HTTPS stránce)',
      description: 'Některé obrázky nebo skripty se načítají přes nezabezpečené HTTP.',
      impact: 'Může způsobit varování v prohlížeči',
    },
    en: {
      title: 'Mixed content (HTTP on HTTPS page)',
      description: 'Some images or scripts load over insecure HTTP.',
      impact: 'May cause browser warnings',
    },
    de: {
      title: 'Gemischter Inhalt (HTTP auf HTTPS-Seite)',
      description: 'Einige Bilder oder Skripte werden über unsicheres HTTP geladen.',
      impact: 'Kann Browser-Warnungen verursachen',
    },
    ru: {
      title: 'Смешанный контент (HTTP на HTTPS странице)',
      description: 'Некоторые изображения или скрипты загружаются через небезопасный HTTP.',
      impact: 'Может вызывать предупреждения браузера',
    },
  },
  no_security_headers: {
    cs: {
      title: 'Chybí bezpečnostní hlavičky',
      description: 'Security headers (CSP, X-Frame-Options) nejsou nastaveny.',
      impact: 'Zvýšené riziko útoků (XSS, clickjacking)',
    },
    en: {
      title: 'Missing security headers',
      description: 'Security headers (CSP, X-Frame-Options) are not set.',
      impact: 'Increased risk of attacks (XSS, clickjacking)',
    },
    de: {
      title: 'Fehlende Sicherheits-Header',
      description: 'Security Headers (CSP, X-Frame-Options) sind nicht gesetzt.',
      impact: 'Erhöhtes Risiko von Angriffen (XSS, Clickjacking)',
    },
    ru: {
      title: 'Отсутствуют заголовки безопасности',
      description: 'Security headers (CSP, X-Frame-Options) не настроены.',
      impact: 'Повышенный риск атак (XSS, clickjacking)',
    },
  },
};

// SEO findings
export const SEO_FINDINGS = {
  no_title: {
    cs: {
      title: 'Chybí title tag',
      description: 'Stránka nemá definovaný title - Google zobrazí náhodný text.',
      impact: 'Výrazně snižuje CTR ve výsledcích vyhledávání',
    },
    en: {
      title: 'Missing title tag',
      description: 'Page has no defined title - Google shows random text.',
      impact: 'Significantly reduces CTR in search results',
    },
    de: {
      title: 'Fehlender Title-Tag',
      description: 'Seite hat keinen definierten Title - Google zeigt zufälligen Text.',
      impact: 'Reduziert die CTR in Suchergebnissen erheblich',
    },
    ru: {
      title: 'Отсутствует title tag',
      description: 'На странице не определен title - Google покажет случайный текст.',
      impact: 'Значительно снижает CTR в результатах поиска',
    },
  },
  title_too_long: {
    cs: {
      title: (length: number) => `Title tag je příliš dlouhý (${length} znaků)`,
      description: 'Optimální délka je 50-60 znaků. Delší text bude oříznut.',
      impact: 'Oříznutý title snižuje atraktivitu ve výsledcích',
    },
    en: {
      title: (length: number) => `Title tag too long (${length} characters)`,
      description: 'Optimal length is 50-60 characters. Longer text will be truncated.',
      impact: 'Truncated title reduces appeal in results',
    },
    de: {
      title: (length: number) => `Title-Tag zu lang (${length} Zeichen)`,
      description: 'Optimale Länge ist 50-60 Zeichen. Längerer Text wird abgeschnitten.',
      impact: 'Abgeschnittener Title reduziert die Attraktivität in Ergebnissen',
    },
    ru: {
      title: (length: number) => `Title tag слишком длинный (${length} символов)`,
      description: 'Оптимальная длина 50-60 символов. Более длинный текст будет обрезан.',
      impact: 'Обрезанный title снижает привлекательность в результатах',
    },
  },
  title_too_short: {
    cs: {
      title: (length: number) => `Title tag je příliš krátký (${length} znaků)`,
      description: 'Nevyužíváte plný potenciál pro klíčová slova.',
      impact: 'Méně informací = nižší CTR',
    },
    en: {
      title: (length: number) => `Title tag too short (${length} characters)`,
      description: 'Not using full potential for keywords.',
      impact: 'Less information = lower CTR',
    },
    de: {
      title: (length: number) => `Title-Tag zu kurz (${length} Zeichen)`,
      description: 'Sie nutzen nicht das volle Potenzial für Keywords.',
      impact: 'Weniger Informationen = niedrigere CTR',
    },
    ru: {
      title: (length: number) => `Title tag слишком короткий (${length} символов)`,
      description: 'Не используется весь потенциал для ключевых слов.',
      impact: 'Меньше информации = ниже CTR',
    },
  },
  no_meta_description: {
    cs: {
      title: 'Chybí meta description',
      description: 'Google zobrazuje náhodný text z webu místo vašeho popisu.',
      impact: 'Nemůžete ovlivnit, co zákazníci vidí ve výsledcích',
    },
    en: {
      title: 'Missing meta description',
      description: 'Google shows random text from website instead of your description.',
      impact: "You can't control what customers see in results",
    },
    de: {
      title: 'Fehlende Meta-Description',
      description: 'Google zeigt zufälligen Text von der Website statt Ihrer Beschreibung.',
      impact: 'Sie können nicht kontrollieren, was Kunden in Ergebnissen sehen',
    },
    ru: {
      title: 'Отсутствует meta description',
      description: 'Google показывает случайный текст с сайта вместо вашего описания.',
      impact: 'Вы не можете контролировать, что клиенты видят в результатах',
    },
  },
  no_h1: {
    cs: {
      title: 'Chybí H1 nadpis',
      description: 'Hlavní nadpis stránky není definován nebo není označen jako H1.',
      impact: 'Google neví, o čem stránka je',
    },
    en: {
      title: 'Missing H1 heading',
      description: 'Main page heading is not defined or not marked as H1.',
      impact: "Google doesn't know what the page is about",
    },
    de: {
      title: 'Fehlende H1-Überschrift',
      description: 'Hauptüberschrift der Seite ist nicht definiert oder nicht als H1 markiert.',
      impact: 'Google weiß nicht, worum es auf der Seite geht',
    },
    ru: {
      title: 'Отсутствует заголовок H1',
      description: 'Главный заголовок страницы не определен или не отмечен как H1.',
      impact: 'Google не знает, о чем страница',
    },
  },
  multiple_h1: {
    cs: {
      title: (count: number) => `Více H1 nadpisů na stránce (${count})`,
      description: 'Měl by být pouze jeden H1 nadpis - hlavní téma stránky.',
      impact: 'Matoucí pro vyhledávače',
    },
    en: {
      title: (count: number) => `Multiple H1 headings on page (${count})`,
      description: 'There should be only one H1 heading - main topic of the page.',
      impact: 'Confusing for search engines',
    },
    de: {
      title: (count: number) => `Mehrere H1-Überschriften auf der Seite (${count})`,
      description: 'Es sollte nur eine H1-Überschrift geben - Hauptthema der Seite.',
      impact: 'Verwirrend für Suchmaschinen',
    },
    ru: {
      title: (count: number) => `Несколько H1 заголовков на странице (${count})`,
      description: 'Должен быть только один H1 заголовок - главная тема страницы.',
      impact: 'Путает поисковые системы',
    },
  },
  images_no_alt_critical: {
    cs: {
      title: (percent: number) => `Obrázky bez alt textů (${percent}%)`,
      description: (missing: number, total: number) => `${missing} z ${total} obrázků nemá alt text.`,
      impact: 'Google nemůže indexovat obrázky, ztrácíte image search traffic',
    },
    en: {
      title: (percent: number) => `Images without alt text (${percent}%)`,
      description: (missing: number, total: number) => `${missing} of ${total} images have no alt text.`,
      impact: 'Google cannot index images, you lose image search traffic',
    },
    de: {
      title: (percent: number) => `Bilder ohne Alt-Text (${percent}%)`,
      description: (missing: number, total: number) => `${missing} von ${total} Bildern haben keinen Alt-Text.`,
      impact: 'Google kann Bilder nicht indexieren, Sie verlieren Image-Search-Traffic',
    },
    ru: {
      title: (percent: number) => `Изображения без alt текста (${percent}%)`,
      description: (missing: number, total: number) => `${missing} из ${total} изображений без alt текста.`,
      impact: 'Google не может индексировать изображения, вы теряете трафик из поиска по картинкам',
    },
  },
  images_no_alt_warning: {
    cs: {
      title: 'Některé obrázky nemají alt text',
      description: (missing: number) => `${missing} obrázků bez popisu.`,
      impact: 'Ztrácíte potenciální návštěvníky z Google Images',
    },
    en: {
      title: 'Some images missing alt text',
      description: (missing: number) => `${missing} images without description.`,
      impact: 'You lose potential visitors from Google Images',
    },
    de: {
      title: 'Einige Bilder ohne Alt-Text',
      description: (missing: number) => `${missing} Bilder ohne Beschreibung.`,
      impact: 'Sie verlieren potenzielle Besucher von Google Images',
    },
    ru: {
      title: 'Некоторые изображения без alt текста',
      description: (missing: number) => `${missing} изображений без описания.`,
      impact: 'Вы теряете потенциальных посетителей из Google Images',
    },
  },
  no_sitemap: {
    cs: {
      title: 'Chybí sitemap.xml',
      description: 'Google má problém najít všechny stránky webu.',
      impact: 'Některé stránky nemusí být indexovány',
    },
    en: {
      title: 'Missing sitemap.xml',
      description: 'Google has trouble finding all pages of the website.',
      impact: 'Some pages may not be indexed',
    },
    de: {
      title: 'Fehlende sitemap.xml',
      description: 'Google hat Probleme, alle Seiten der Website zu finden.',
      impact: 'Einige Seiten werden möglicherweise nicht indexiert',
    },
    ru: {
      title: 'Отсутствует sitemap.xml',
      description: 'Google не может найти все страницы сайта.',
      impact: 'Некоторые страницы могут не индексироваться',
    },
  },
  no_structured_data: {
    cs: {
      title: 'Chybí strukturovaná data (Schema.org)',
      description: 'Web nemá JSON-LD schema markup pro rich snippets.',
      impact: 'Přidání LocalBusiness schema zvýší viditelnost v lokálním vyhledávání',
    },
    en: {
      title: 'Missing structured data (Schema.org)',
      description: 'Website lacks JSON-LD schema markup for rich snippets.',
      impact: 'Adding LocalBusiness schema increases visibility in local search',
    },
    de: {
      title: 'Fehlende strukturierte Daten (Schema.org)',
      description: 'Website hat kein JSON-LD Schema-Markup für Rich Snippets.',
      impact: 'LocalBusiness Schema erhöht Sichtbarkeit in der lokalen Suche',
    },
    ru: {
      title: 'Отсутствуют структурированные данные (Schema.org)',
      description: 'На сайте нет JSON-LD schema разметки для rich snippets.',
      impact: 'Добавление LocalBusiness schema повысит видимость в локальном поиске',
    },
  },
};

// GEO/AIEO findings
export const GEO_FINDINGS = {
  no_faq: {
    cs: {
      title: 'Chybí FAQ sekce',
      description: 'AI asistenti (ChatGPT, Perplexity) potřebují strukturované odpovědi na časté dotazy.',
      impact: 'FAQ sekce s 10+ otázkami může zvýšit citovanost v AI odpovědích o 40%',
    },
    en: {
      title: 'Missing FAQ section',
      description: 'AI assistants (ChatGPT, Perplexity) need structured answers to common questions.',
      impact: 'FAQ section with 10+ questions can increase AI citation rate by 40%',
    },
    de: {
      title: 'Fehlender FAQ-Bereich',
      description: 'KI-Assistenten (ChatGPT, Perplexity) benötigen strukturierte Antworten auf häufige Fragen.',
      impact: 'FAQ-Bereich mit 10+ Fragen kann die KI-Zitierrate um 40% erhöhen',
    },
    ru: {
      title: 'Отсутствует раздел FAQ',
      description: 'AI-ассистенты (ChatGPT, Perplexity) нуждаются в структурированных ответах на частые вопросы.',
      impact: 'Раздел FAQ с 10+ вопросами может увеличить цитирование в AI на 40%',
    },
  },
  no_local_business_schema: {
    cs: {
      title: 'Chybí LocalBusiness schema',
      description: 'AI vyhledávače nedokáží ověřit důvěryhodnost a lokaci vašeho podniku.',
      impact: 'Přidání schema s otevírací dobou a ceníkem zvýší citovanost v AI',
    },
    en: {
      title: 'Missing LocalBusiness schema',
      description: 'AI search engines cannot verify credibility and location of your business.',
      impact: 'Adding schema with hours and pricing increases AI citation',
    },
    de: {
      title: 'Fehlendes LocalBusiness-Schema',
      description: 'KI-Suchmaschinen können Glaubwürdigkeit und Standort Ihres Unternehmens nicht verifizieren.',
      impact: 'Schema mit Öffnungszeiten und Preisen erhöht KI-Zitierung',
    },
    ru: {
      title: 'Отсутствует LocalBusiness schema',
      description: 'AI-поисковики не могут проверить достоверность и локацию вашего бизнеса.',
      impact: 'Добавление schema с часами работы и ценами повысит цитирование в AI',
    },
  },
  no_business_info: {
    cs: {
      title: 'Chybí konkrétní informace o podniku',
      description: 'Web neobsahuje adresu ani otevírací dobu.',
      impact: 'AI asistenti nemohou odpovědět na dotazy typu "kde najdu" nebo "kdy máte otevřeno"',
    },
    en: {
      title: 'Missing business information',
      description: 'Website lacks address and opening hours.',
      impact: 'AI assistants cannot answer "where to find" or "when are you open" questions',
    },
    de: {
      title: 'Fehlende Geschäftsinformationen',
      description: 'Website enthält keine Adresse und Öffnungszeiten.',
      impact: 'KI-Assistenten können "wo finde ich" oder "wann haben Sie geöffnet" Fragen nicht beantworten',
    },
    ru: {
      title: 'Отсутствует информация о бизнесе',
      description: 'На сайте нет адреса и часов работы.',
      impact: 'AI-ассистенты не могут ответить на вопросы "где найти" или "когда открыто"',
    },
  },
  no_pricing: {
    cs: {
      title: 'Ceník není strukturovaný',
      description: 'Přehledný ceník s konkrétními cenami pomáhá AI odpovídat na cenové dotazy.',
      impact: (businessLabel: string) => `Zákazníci hledající "${businessLabel} cena" vás nenajdou`,
    },
    en: {
      title: 'Pricing not structured',
      description: 'Clear pricing with specific prices helps AI answer price questions.',
      impact: (businessLabel: string) => `Customers searching "${businessLabel} price" won't find you`,
    },
    de: {
      title: 'Preise nicht strukturiert',
      description: 'Klare Preise mit konkreten Angaben helfen KI bei Preisfragen.',
      impact: (businessLabel: string) => `Kunden, die nach "${businessLabel} Preis" suchen, finden Sie nicht`,
    },
    ru: {
      title: 'Цены не структурированы',
      description: 'Четкий прайс с конкретными ценами помогает AI отвечать на вопросы о ценах.',
      impact: (businessLabel: string) => `Клиенты, ищущие "${businessLabel} цена", вас не найдут`,
    },
  },
  outdated_content: {
    cs: {
      title: 'Obsah působí zastarale',
      description: (year: number | string) => `Copyright nebo datum aktualizace je z roku ${year || 'neznámý'}.`,
      impact: 'AI preferuje aktuální obsah při generování odpovědí',
    },
    en: {
      title: 'Content appears outdated',
      description: (year: number | string) => `Copyright or update date is from ${year || 'unknown'}.`,
      impact: 'AI prefers current content when generating responses',
    },
    de: {
      title: 'Inhalt wirkt veraltet',
      description: (year: number | string) => `Copyright oder Aktualisierungsdatum ist von ${year || 'unbekannt'}.`,
      impact: 'KI bevorzugt aktuelle Inhalte bei der Antwortgenerierung',
    },
    ru: {
      title: 'Контент выглядит устаревшим',
      description: (year: number | string) => `Copyright или дата обновления от ${year || 'неизвестно'}.`,
      impact: 'AI предпочитает актуальный контент при генерации ответов',
    },
  },
  geo_opportunity: {
    cs: {
      title: 'Optimalizace pro AI vyhledávače (GEO)',
      description: 'V roce 2025 přes 400 milionů lidí používá ChatGPT týdně. Optimalizace pro AI je nový standard.',
      impact: 'Weby optimalizované pro GEO mají až 40% vyšší citovanost',
    },
    en: {
      title: 'AI search optimization (GEO)',
      description: 'In 2025, over 400 million people use ChatGPT weekly. AI optimization is the new standard.',
      impact: 'GEO-optimized websites have up to 40% higher citation rate',
    },
    de: {
      title: 'KI-Suchoptimierung (GEO)',
      description: 'Im Jahr 2025 nutzen über 400 Millionen Menschen ChatGPT wöchentlich. KI-Optimierung ist der neue Standard.',
      impact: 'GEO-optimierte Websites haben bis zu 40% höhere Zitierrate',
    },
    ru: {
      title: 'Оптимизация для AI-поиска (GEO)',
      description: 'В 2025 году более 400 миллионов людей используют ChatGPT еженедельно. AI-оптимизация — новый стандарт.',
      impact: 'Сайты, оптимизированные для GEO, имеют до 40% больше цитирований',
    },
  },
};

// Design findings
export const DESIGN_FINDINGS = {
  design_outdated_critical: {
    cs: {
      title: (year: number) => `Design vypadá jako z roku ${year}`,
      description: 'Vizuální styl webu je zastaralý a neodpovídá moderním standardům.',
      impact: 'První dojem odrazuje moderní zákazníky hledající kvalitní služby',
    },
    en: {
      title: (year: number) => `Design looks like it's from ${year}`,
      description: 'Visual style is outdated and does not meet modern standards.',
      impact: 'First impression discourages modern customers looking for quality services',
    },
    de: {
      title: (year: number) => `Design sieht aus wie von ${year}`,
      description: 'Visueller Stil ist veraltet und entspricht nicht modernen Standards.',
      impact: 'Erster Eindruck schreckt moderne Kunden ab, die Qualitätsdienstleistungen suchen',
    },
    ru: {
      title: (year: number) => `Дизайн выглядит как из ${year} года`,
      description: 'Визуальный стиль устарел и не соответствует современным стандартам.',
      impact: 'Первое впечатление отпугивает современных клиентов, ищущих качественные услуги',
    },
  },
  design_outdated_warning: {
    cs: {
      title: 'Design by zasloužil modernizaci',
      description: 'Web funguje, ale vizuálně zaostává za konkurencí.',
      impact: 'Modernější vzhled zvyšuje důvěryhodnost',
    },
    en: {
      title: 'Design needs modernization',
      description: 'Website works, but visually lags behind competition.',
      impact: 'More modern look increases credibility',
    },
    de: {
      title: 'Design braucht Modernisierung',
      description: 'Website funktioniert, hinkt aber visuell der Konkurrenz hinterher.',
      impact: 'Moderneres Aussehen erhöht die Glaubwürdigkeit',
    },
    ru: {
      title: 'Дизайн нуждается в модернизации',
      description: 'Сайт работает, но визуально отстает от конкурентов.',
      impact: 'Более современный вид повышает доверие',
    },
  },
  no_booking: {
    cs: {
      title: 'Chybí online rezervace',
      description: 'Klienti musí volat pro objednání - mnoho raději odejde ke konkurenci.',
      impact: 'Online rezervace může zvýšit počet zákazníků o 25-40%',
    },
    en: {
      title: 'Missing online booking',
      description: 'Clients must call to book - many prefer to go to competition.',
      impact: 'Online booking can increase customers by 25-40%',
    },
    de: {
      title: 'Fehlende Online-Buchung',
      description: 'Kunden müssen anrufen um zu buchen - viele gehen lieber zur Konkurrenz.',
      impact: 'Online-Buchung kann Kunden um 25-40% erhöhen',
    },
    ru: {
      title: 'Отсутствует онлайн-бронирование',
      description: 'Клиенты должны звонить для записи - многие предпочитают уйти к конкурентам.',
      impact: 'Онлайн-бронирование может увеличить количество клиентов на 25-40%',
    },
  },
  no_contact: {
    cs: {
      title: 'Chybí kontaktní možnosti',
      description: 'Web nemá viditelné telefonní číslo ani WhatsApp.',
      impact: 'Zákazníci nemohou kontaktovat - kritická chyba',
    },
    en: {
      title: 'Missing contact options',
      description: 'Website has no visible phone number or WhatsApp.',
      impact: 'Customers cannot contact - critical error',
    },
    de: {
      title: 'Fehlende Kontaktmöglichkeiten',
      description: 'Website hat keine sichtbare Telefonnummer oder WhatsApp.',
      impact: 'Kunden können nicht kontaktieren - kritischer Fehler',
    },
    ru: {
      title: 'Отсутствуют контактные данные',
      description: 'На сайте нет видимого номера телефона или WhatsApp.',
      impact: 'Клиенты не могут связаться - критическая ошибка',
    },
  },
  no_whatsapp: {
    cs: {
      title: 'Přidejte WhatsApp tlačítko',
      description: 'Mnoho klientů preferuje diskrétní komunikaci přes WhatsApp.',
      impact: 'WhatsApp tlačítko může zvýšit konverze o 25%',
    },
    en: {
      title: 'Add WhatsApp button',
      description: 'Many clients prefer discreet communication via WhatsApp.',
      impact: 'WhatsApp button can increase conversions by 25%',
    },
    de: {
      title: 'WhatsApp-Button hinzufügen',
      description: 'Viele Kunden bevorzugen diskrete Kommunikation über WhatsApp.',
      impact: 'WhatsApp-Button kann Konversionen um 25% erhöhen',
    },
    ru: {
      title: 'Добавьте кнопку WhatsApp',
      description: 'Многие клиенты предпочитают дискретное общение через WhatsApp.',
      impact: 'Кнопка WhatsApp может увеличить конверсию на 25%',
    },
  },
  pricing_unclear: {
    cs: {
      title: 'Ceník není přehledný',
      description: 'Zákazníci nevědí, co mohou očekávat - mnoho odejde.',
      impact: 'Transparentní ceny budují důvěru',
    },
    en: {
      title: 'Pricing unclear',
      description: "Customers don't know what to expect - many leave.",
      impact: 'Transparent pricing builds trust',
    },
    de: {
      title: 'Preise unklar',
      description: 'Kunden wissen nicht, was sie erwartet - viele gehen.',
      impact: 'Transparente Preise schaffen Vertrauen',
    },
    ru: {
      title: 'Цены неясны',
      description: 'Клиенты не знают, чего ожидать - многие уходят.',
      impact: 'Прозрачные цены создают доверие',
    },
  },
  wordpress_detected: {
    cs: {
      title: 'Web běží na WordPress',
      description: 'WordPress je náchylný k bezpečnostním problémům a bývá pomalý.',
      impact: 'Moderní technologie (Next.js) jsou rychlejší a bezpečnější',
    },
    en: {
      title: 'Website runs on WordPress',
      description: 'WordPress is prone to security issues and tends to be slow.',
      impact: 'Modern technologies (Next.js) are faster and more secure',
    },
    de: {
      title: 'Website läuft auf WordPress',
      description: 'WordPress ist anfällig für Sicherheitsprobleme und oft langsam.',
      impact: 'Moderne Technologien (Next.js) sind schneller und sicherer',
    },
    ru: {
      title: 'Сайт работает на WordPress',
      description: 'WordPress подвержен проблемам безопасности и обычно медленный.',
      impact: 'Современные технологии (Next.js) быстрее и безопаснее',
    },
  },
};

// Business type labels
export const BUSINESS_TYPE_LABELS_I18N = {
  cs: {
    massage: 'Erotické masáže',
    privat: 'Privát / Klub',
    escort: 'Escort',
  },
  en: {
    massage: 'Erotic Massage',
    privat: 'Private / Club',
    escort: 'Escort',
  },
  de: {
    massage: 'Erotische Massage',
    privat: 'Privat / Club',
    escort: 'Escort',
  },
  ru: {
    massage: 'Эротический массаж',
    privat: 'Приват / Клуб',
    escort: 'Эскорт',
  },
};

// Finding type labels
export const FINDING_TYPE_LABELS = {
  cs: {
    critical: 'Kritické',
    warning: 'Varování',
    opportunity: 'Příležitost',
  },
  en: {
    critical: 'Critical',
    warning: 'Warning',
    opportunity: 'Opportunity',
  },
  de: {
    critical: 'Kritisch',
    warning: 'Warnung',
    opportunity: 'Chance',
  },
  ru: {
    critical: 'Критично',
    warning: 'Предупреждение',
    opportunity: 'Возможность',
  },
};

// Category labels
export const CATEGORY_LABELS_I18N = {
  cs: {
    speed: 'Rychlost',
    mobile: 'Mobilní verze',
    security: 'Zabezpečení',
    seo: 'SEO',
    geo: 'GEO/AIEO',
    design: 'Design',
  },
  en: {
    speed: 'Speed',
    mobile: 'Mobile',
    security: 'Security',
    seo: 'SEO',
    geo: 'GEO/AIEO',
    design: 'Design',
  },
  de: {
    speed: 'Geschwindigkeit',
    mobile: 'Mobil',
    security: 'Sicherheit',
    seo: 'SEO',
    geo: 'GEO/AIEO',
    design: 'Design',
  },
  ru: {
    speed: 'Скорость',
    mobile: 'Мобильная версия',
    security: 'Безопасность',
    seo: 'SEO',
    geo: 'GEO/AIEO',
    design: 'Дизайн',
  },
};
