import type { AIDesignSuggestion } from "@/types/ai-design";

/**
 * Admin notification email when new lead is received
 */
export function generateAdminNotificationEmail(leadData: {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyName: string;
  projectType: string;
  budget: string;
  timeline: string;
  businessDescription: string;
  features?: string[];
  designPreferences?: any;
}) {
  const adminUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://weblyx.cz';
  const leadDetailUrl = `${adminUrl}/admin/leads?leadId=${leadData.id}`;

  const subject = `🔔 Nová poptávka: ${leadData.companyName} - ${leadData.projectType}`;

  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nová poptávka</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #14B8A6; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                🔔 Nová Poptávka
              </h1>
            </td>
          </tr>

          <!-- Contact Info -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #111827; font-weight: 700;">
                Kontaktní údaje
              </h2>
              <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 14px;">
                <tr>
                  <td style="color: #6b7280; width: 120px;">Jméno:</td>
                  <td style="color: #111827; font-weight: 600;">${leadData.name}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280;">Email:</td>
                  <td style="color: #111827;">
                    <a href="mailto:${leadData.email}" style="color: #14B8A6; text-decoration: none;">
                      ${leadData.email}
                    </a>
                  </td>
                </tr>
                ${leadData.phone ? `
                <tr>
                  <td style="color: #6b7280;">Telefon:</td>
                  <td style="color: #111827;">
                    <a href="tel:${leadData.phone}" style="color: #14B8A6; text-decoration: none;">
                      ${leadData.phone}
                    </a>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="color: #6b7280;">Společnost:</td>
                  <td style="color: #111827; font-weight: 600;">${leadData.companyName}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Project Info -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #111827; font-weight: 700;">
                Informace o projektu
              </h2>
              <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 14px;">
                <tr>
                  <td style="color: #6b7280; width: 120px;">Typ projektu:</td>
                  <td style="color: #111827; font-weight: 600;">${leadData.projectType}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280;">Rozpočet:</td>
                  <td style="color: #111827;">${leadData.budget}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280;">Časový rámec:</td>
                  <td style="color: #111827;">${leadData.timeline}</td>
                </tr>
              </table>

              <div style="margin-top: 20px;">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; font-weight: 600;">
                  Popis byznysu:
                </p>
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border-left: 3px solid #14B8A6;">
                  <p style="margin: 0; color: #111827; font-size: 14px; line-height: 1.6;">
                    ${leadData.businessDescription}
                  </p>
                </div>
              </div>

              ${leadData.features && leadData.features.length > 0 ? `
              <div style="margin-top: 20px;">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; font-weight: 600;">
                  Požadované funkce:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #111827; font-size: 14px; line-height: 1.8;">
                  ${leadData.features.map(f => `<li>${f}</li>`).join('')}
                </ul>
              </div>
              ` : ''}
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 30px 30px;" align="center">
              <a href="${leadDetailUrl}"
                 style="display: inline-block; background-color: #14B8A6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(20, 184, 166, 0.3);">
                📋 Zobrazit detail v admin panelu
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
                Automatická notifikace z Weblyx CRM systému
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
🔔 NOVÁ POPTÁVKA

KONTAKTNÍ ÚDAJE:
Jméno: ${leadData.name}
Email: ${leadData.email}
${leadData.phone ? `Telefon: ${leadData.phone}` : ''}
Společnost: ${leadData.companyName}

PROJEKT:
Typ: ${leadData.projectType}
Rozpočet: ${leadData.budget}
Časový rámec: ${leadData.timeline}

POPIS:
${leadData.businessDescription}

${leadData.features && leadData.features.length > 0 ? `
POŽADOVANÉ FUNKCE:
${leadData.features.map(f => `- ${f}`).join('\n')}
` : ''}

Zobrazit detail: ${leadDetailUrl}
  `;

  return { subject, html, text };
}

/**
 * Client email with AI design proposals
 */
export function generateClientProposalEmail(data: {
  clientName: string;
  companyName: string;
  aiDesignSuggestion?: AIDesignSuggestion;
  aiBrief?: any;
}) {
  const subject = `Váš AI návrh je připraven - ${data.companyName}`;

  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Váš AI návrh webu</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">
                ✨ Váš AI Návrh je Připraven!
              </h1>
              <p style="color: #D1FAE5; margin: 0; font-size: 16px;">
                Personalizované doporučení pro ${data.companyName}
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.6;">
                Dobrý den ${data.clientName},
              </p>
              <p style="margin: 15px 0 0 0; font-size: 16px; color: #374151; line-height: 1.6;">
                děkujeme za Vaši poptávku! Náš AI systém pro Vás připravil personalizovaný návrh webu založený na Vašich požadavcích.
              </p>
            </td>
          </tr>

          ${data.aiDesignSuggestion ? `
          <!-- Color Palette -->
          <tr>
            <td style="padding: 20px 30px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #111827; font-weight: 700;">
                🎨 Barevná Paleta
              </h2>
              <div style="display: flex; gap: 10px;">
                <div style="flex: 1; text-align: center;">
                  <div style="background-color: ${data.aiDesignSuggestion.colorPalette.primary}; height: 60px; border-radius: 6px; margin-bottom: 8px;"></div>
                  <p style="margin: 0; font-size: 12px; color: #6b7280;">Primární</p>
                  <p style="margin: 4px 0 0 0; font-size: 11px; color: #9ca3af; font-family: monospace;">
                    ${data.aiDesignSuggestion.colorPalette.primary}
                  </p>
                </div>
                <div style="flex: 1; text-align: center;">
                  <div style="background-color: ${data.aiDesignSuggestion.colorPalette.secondary}; height: 60px; border-radius: 6px; margin-bottom: 8px;"></div>
                  <p style="margin: 0; font-size: 12px; color: #6b7280;">Sekundární</p>
                  <p style="margin: 4px 0 0 0; font-size: 11px; color: #9ca3af; font-family: monospace;">
                    ${data.aiDesignSuggestion.colorPalette.secondary}
                  </p>
                </div>
                <div style="flex: 1; text-align: center;">
                  <div style="background-color: ${data.aiDesignSuggestion.colorPalette.accent}; height: 60px; border-radius: 6px; margin-bottom: 8px;"></div>
                  <p style="margin: 0; font-size: 12px; color: #6b7280;">Akcent</p>
                  <p style="margin: 4px 0 0 0; font-size: 11px; color: #9ca3af; font-family: monospace;">
                    ${data.aiDesignSuggestion.colorPalette.accent}
                  </p>
                </div>
              </div>
            </td>
          </tr>

          <!-- Typography -->
          <tr>
            <td style="padding: 20px 30px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #111827; font-weight: 700;">
                📝 Typografie
              </h2>
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
                  <strong>Nadpisy:</strong> ${data.aiDesignSuggestion.typography.headingFont}
                </p>
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                  <strong>Text:</strong> ${data.aiDesignSuggestion.typography.bodyFont}
                </p>
              </div>
            </td>
          </tr>

          <!-- Content Suggestions -->
          ${data.aiDesignSuggestion.contentSuggestions ? `
          <tr>
            <td style="padding: 20px 30px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #111827; font-weight: 700;">
                💡 Návrh Obsahu
              </h2>
              <div style="background-color: #f0fdfa; padding: 20px; border-radius: 6px; border-left: 4px solid #14B8A6;">
                ${data.aiDesignSuggestion.contentSuggestions.headline ? `
                <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #0f766e;">
                  "${data.aiDesignSuggestion.contentSuggestions.headline}"
                </h3>
                ` : ''}
                ${data.aiDesignSuggestion.contentSuggestions.tagline ? `
                <p style="margin: 0 0 15px 0; font-size: 14px; color: #14532d;">
                  ${data.aiDesignSuggestion.contentSuggestions.tagline}
                </p>
                ` : ''}
                ${data.aiDesignSuggestion.contentSuggestions.ctaPrimary ? `
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                  <strong>Hlavní CTA:</strong> "${data.aiDesignSuggestion.contentSuggestions.ctaPrimary}"
                </p>
                ` : ''}
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Technical Recommendations -->
          ${data.aiDesignSuggestion.technicalRecommendations?.recommendedFeatures ? `
          <tr>
            <td style="padding: 20px 30px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #111827; font-weight: 700;">
                ⚙️ Doporučené Funkce
              </h2>
              <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                ${data.aiDesignSuggestion.technicalRecommendations.recommendedFeatures.slice(0, 5).map(f => `<li>${f}</li>`).join('')}
              </ul>
            </td>
          </tr>
          ` : ''}
          ` : `
          <!-- AI Generation in Progress -->
          <tr>
            <td style="padding: 20px 30px;">
              <div style="background-color: #fffbeb; padding: 20px; border-radius: 6px; text-align: center;">
                <p style="margin: 0; font-size: 16px; color: #92400e;">
                  🤖 AI analýza probíhá...
                </p>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #78350f;">
                  Váš personalizovaný návrh Vám zašleme do 24 hodin.
                </p>
              </div>
            </td>
          </tr>
          `}

          <!-- Next Steps -->
          <tr>
            <td style="padding: 20px 30px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #111827; font-weight: 700;">
                📞 Další Kroky
              </h2>
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px;">
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #374151; line-height: 1.6;">
                  1️⃣ Projděte si AI návrh výše<br>
                  2️⃣ Připravte si případné dotazy nebo úpravy<br>
                  3️⃣ Domluvme si nezávaznou konzultaci
                </p>
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 30px 30px 40px 30px;" align="center">
              <a href="https://weblyx.cz/kontakt?ref=ai-proposal"
                 style="display: inline-block; background-color: #14B8A6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(20, 184, 166, 0.3);">
                💬 Domluvit konzultaci
              </a>
              <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280;">
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
                Weblyx | Moderní webové stránky<br>
                Email: info@weblyx.cz | Web: weblyx.cz
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
✨ VÁŠ AI NÁVRH JE PŘIPRAVEN!

Dobrý den ${data.clientName},

Děkujeme za Vaši poptávku! Náš AI systém pro Vás připravil personalizovaný návrh webu.

${data.aiDesignSuggestion ? `
🎨 BAREVNÁ PALETA:
- Primární: ${data.aiDesignSuggestion.colorPalette.primary}
- Sekundární: ${data.aiDesignSuggestion.colorPalette.secondary}
- Akcent: ${data.aiDesignSuggestion.colorPalette.accent}

📝 TYPOGRAFIE:
- Nadpisy: ${data.aiDesignSuggestion.typography.headingFont}
- Text: ${data.aiDesignSuggestion.typography.bodyFont}

${data.aiDesignSuggestion.contentSuggestions?.headline ? `
💡 NÁVRH OBSAHU:
Hlavní nadpis: "${data.aiDesignSuggestion.contentSuggestions.headline}"
${data.aiDesignSuggestion.contentSuggestions.tagline || ''}
` : ''}

${data.aiDesignSuggestion.technicalRecommendations?.recommendedFeatures ? `
⚙️ DOPORUČENÉ FUNKCE:
${data.aiDesignSuggestion.technicalRecommendations.recommendedFeatures.slice(0, 5).map(f => `- ${f}`).join('\n')}
` : ''}
` : `
🤖 AI analýza probíhá...
Váš personalizovaný návrh Vám zašleme do 24 hodin.
`}

📞 DALŠÍ KROKY:
1️⃣ Projděte si AI návrh výše
2️⃣ Připravte si případné dotazy nebo úpravy
3️⃣ Domluvme si nezávaznou konzultaci

💬 KONTAKT:
Web: https://weblyx.cz/kontakt?ref=ai-proposal
Telefon: +420 XXX XXX XXX

S pozdravem,
Tým Weblyx

--
Weblyx | Moderní webové stránky
Email: info@weblyx.cz | Web: weblyx.cz
  `;

  return { subject, html, text };
}

/**
 * Immediate thank you email to client (auto-response)
 */
export function generateClientThankYouEmail(data: {
  clientName: string;
  companyName: string;
  projectType: string;
}) {
  const subject = `Děkujeme za poptávku - ${data.companyName} | Weblyx`;

  // Map project type to Czech
  const projectTypeMap: Record<string, string> = {
    'new-web': 'nový web',
    'redesign': 'redesign webu',
    'eshop': 'e-shop',
    'landing': 'landing page',
    'other': 'webové řešení',
  };

  const projectTypeCz = projectTypeMap[data.projectType] || data.projectType;

  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Děkujeme za poptávku</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                Dobrý den <strong>${data.clientName}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                děkujeme, že jste nám odeslali poptávku na <strong>${projectTypeCz}</strong> pro projekt <strong>${data.companyName}</strong>.
              </p>
              <p style="margin: 0 0 30px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                Váš požadavek jsme přijali a budeme vás kontaktovat nejpozději do 24 hodin.
              </p>
              <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.6;">
                S pozdravem,<br>
                <strong>Tým Weblyx</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 14px; color: #6b7280; text-align: center; line-height: 1.6;">
                Máte mezitím dotaz? Napište nám na
                <a href="mailto:info@weblyx.cz" style="color: #14B8A6; text-decoration: none; font-weight: 600;">info@weblyx.cz</a>
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
Dobrý den ${data.clientName},

děkujeme, že jste nám odeslali poptávku na ${projectTypeCz} pro projekt ${data.companyName}.

Váš požadavek jsme přijali a budeme vás kontaktovat nejpozději do 24 hodin.

S pozdravem,
Tým Weblyx

--
Máte mezitím dotaz? Napište nám na info@weblyx.cz
  `;

  return { subject, html, text };
}
