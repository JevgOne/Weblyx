import { WebAnalysisResult, PromoCode } from '@/types/cms';

interface ColdEmailOptions {
  recipientName: string;
  recipientEmail: string;
  businessName: string;
  analysis: WebAnalysisResult;
  promoCode?: PromoCode;
}

export function generateColdEmail(options: ColdEmailOptions): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    recipientName,
    businessName,
    analysis,
    promoCode
  } = options;

  const criticalIssues = analysis.issues.filter(i => i.category === 'critical').length;
  const scoreColor = analysis.overallScore >= 60 ? '#10b981' : analysis.overallScore >= 40 ? '#f59e0b' : '#ef4444';

  const subject = `${businessName} - Bezplatná analýza vašeho webu (skóre: ${analysis.overallScore}/100)`;

  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Analýza webu ${businessName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                Analýza vašeho webu
              </h1>
              <p style="color: #e9d5ff; margin: 10px 0 0 0; font-size: 16px;">
                Identifikovali jsme příležitosti ke zlepšení
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.6;">
                Dobrý den ${recipientName},
              </p>
              <p style="margin: 15px 0 0 0; font-size: 16px; color: #374151; line-height: 1.6;">
                provedli jsme bezplatnou analýzu vašeho webu <strong>${analysis.url}</strong> a rádi bychom se s vámi podělili o zjištění.
              </p>
            </td>
          </tr>

          <!-- Score Card -->
          <tr>
            <td style="padding: 20px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 12px; padding: 25px;">
                <tr>
                  <td align="center">
                    <div style="font-size: 64px; font-weight: 800; color: ${scoreColor}; margin: 0;">
                      ${analysis.overallScore}
                    </div>
                    <p style="margin: 10px 0 0 0; font-size: 18px; color: #6b7280; font-weight: 600;">
                      Celkové skóre webu
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Issues Summary -->
          <tr>
            <td style="padding: 20px 30px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #111827; font-weight: 700;">
                📊 Souhrn problémů
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px; background-color: #fee2e2; border-radius: 8px; margin-bottom: 10px;">
                    <span style="font-weight: 700; color: #991b1b; font-size: 16px;">🚨 ${analysis.issueCount.critical} kritických problémů</span>
                  </td>
                </tr>
                <tr><td height="10"></td></tr>
                <tr>
                  <td style="padding: 12px; background-color: #fef3c7; border-radius: 8px; margin-bottom: 10px;">
                    <span style="font-weight: 600; color: #92400e; font-size: 16px;">⚠️ ${analysis.issueCount.warning} varování</span>
                  </td>
                </tr>
                <tr><td height="10"></td></tr>
                <tr>
                  <td style="padding: 12px; background-color: #dbeafe; border-radius: 8px;">
                    <span style="font-weight: 600; color: #1e40af; font-size: 16px;">ℹ️ ${analysis.issueCount.info} informací</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Top Issues -->
          ${criticalIssues > 0 ? `
          <tr>
            <td style="padding: 20px 30px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #111827; font-weight: 700;">
                🔥 Hlavní problémy k řešení
              </h2>
              ${analysis.issues
                .filter(i => i.category === 'critical')
                .slice(0, 3)
                .map(issue => `
                  <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin-bottom: 12px; border-radius: 6px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #991b1b; font-weight: 700;">
                      ${issue.title}
                    </h3>
                    <p style="margin: 0; font-size: 14px; color: #7f1d1d; line-height: 1.5;">
                      ${issue.description}
                    </p>
                  </div>
                `).join('')}
            </td>
          </tr>
          ` : ''}

          <!-- Package Recommendation -->
          <tr>
            <td style="padding: 20px 30px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #111827; font-weight: 700;">
                💡 Naše doporučení
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 25px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 10px 0; font-size: 24px; color: #ffffff; font-weight: 800;">
                      ${analysis.recommendation.packageName}
                    </h3>
                    <p style="margin: 0 0 15px 0; font-size: 15px; color: #e9d5ff; line-height: 1.6;">
                      ${analysis.recommendation.reasoning}
                    </p>
                    <div style="margin-top: 15px;">
                      ${analysis.recommendation.matchedNeeds.map(need => `
                        <div style="padding: 8px 0; color: #ffffff; font-size: 14px;">
                          ✅ ${need}
                        </div>
                      `).join('')}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Promo Code -->
          ${promoCode ? `
          <tr>
            <td style="padding: 20px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border: 2px dashed #f59e0b; border-radius: 12px; padding: 20px;">
                <tr>
                  <td align="center">
                    <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #92400e; font-weight: 700;">
                      🎁 Speciální nabídka pro vás
                    </h3>
                    <p style="margin: 0 0 15px 0; font-size: 14px; color: #78350f;">
                      ${promoCode.description}
                    </p>
                    <div style="background-color: #ffffff; border-radius: 8px; padding: 15px; display: inline-block;">
                      <code style="font-size: 24px; font-weight: 800; color: #f59e0b; letter-spacing: 2px; font-family: 'Courier New', monospace;">
                        ${promoCode.code}
                      </code>
                    </div>
                    <p style="margin: 15px 0 0 0; font-size: 13px; color: #78350f;">
                      ${promoCode.discountType === 'percentage'
                        ? `Sleva ${promoCode.discountValue}%`
                        : `Sleva ${promoCode.discountValue} Kč`}
                      · Platnost do ${new Date(promoCode.validUntil).toLocaleDateString('cs-CZ')}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- CTA -->
          <tr>
            <td style="padding: 30px 30px 40px 30px;" align="center">
              <a href="https://weblyx.cz/kontakt?ref=analysis"
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 700; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                📞 Nezávazná konzultace zdarma
              </a>
              <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                Nebo nám zavolejte: <strong style="color: #111827;">+420 XXX XXX XXX</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; font-size: 16px; color: #111827; font-weight: 600;">
                S pozdravem,<br>
                Tým Weblyx
              </p>
              <p style="margin: 15px 0 0 0; font-size: 12px; color: #9ca3af; line-height: 1.6;">
                Weblyx s.r.o. | Moderní webové stránky od 7 000 Kč<br>
                Email: info@weblyx.cz | Web: weblyx.cz
              </p>
              <p style="margin: 15px 0 0 0; font-size: 11px; color: #9ca3af; line-height: 1.5;">
                Tento email jsme vám zaslali na základě veřejně dostupných údajů o vaší firmě.
                Pokud si nepřejete další komunikaci, <a href="#" style="color: #667eea; text-decoration: underline;">klikněte zde</a>
                pro odhlášení. V souladu s GDPR respektujeme vaše právo na ochranu osobních údajů.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Dobrý den ${recipientName},

provedli jsme bezplatnou analýzu vašeho webu ${analysis.url} a rádi bychom se s vámi podělili o zjištění.

CELKOVÉ SKÓRE: ${analysis.overallScore}/100

SOUHRN PROBLÉMŮ:
🚨 ${analysis.issueCount.critical} kritických problémů
⚠️ ${analysis.issueCount.warning} varování
ℹ️ ${analysis.issueCount.info} informací

${criticalIssues > 0 ? `
HLAVNÍ PROBLÉMY K ŘEŠENÍ:
${analysis.issues
  .filter(i => i.category === 'critical')
  .slice(0, 3)
  .map((issue, idx) => `${idx + 1}. ${issue.title}\n   ${issue.description}`)
  .join('\n\n')}
` : ''}

NAŠE DOPORUČENÍ:
${analysis.recommendation.packageName}
${analysis.recommendation.reasoning}

Co tento balíček vyřeší:
${analysis.recommendation.matchedNeeds.map(need => `✅ ${need}`).join('\n')}

${promoCode ? `
🎁 SPECIÁLNÍ NABÍDKA PRO VÁS:
${promoCode.description}
Kód: ${promoCode.code}
${promoCode.discountType === 'percentage'
  ? `Sleva ${promoCode.discountValue}%`
  : `Sleva ${promoCode.discountValue} Kč`}
Platnost do ${new Date(promoCode.validUntil).toLocaleDateString('cs-CZ')}
` : ''}

📞 NEZÁVAZNÁ KONZULTACE ZDARMA:
https://weblyx.cz/kontakt?ref=analysis
Nebo nám zavolejte: +420 XXX XXX XXX

S pozdravem,
Tým Weblyx

--
Weblyx s.r.o. | Moderní webové stránky od 7 000 Kč
Email: info@weblyx.cz | Web: weblyx.cz

Tento email jsme vám zaslali na základě veřejně dostupných údajů o vaší firmě.
Pokud si nepřejete další komunikaci, odpovězte na tento email s textem "ODHLÁSIT".
V souladu s GDPR respektujeme vaše právo na ochranu osobních údajů.
  `;

  return { subject, html, text };
}
