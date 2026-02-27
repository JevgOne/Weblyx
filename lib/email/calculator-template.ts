import { PackageResult } from '@/lib/calculator/types';

interface CalculatorEmailOptions {
  name: string;
  priceResult: PackageResult;
  projectType: string;
  features: string[];
}

export function generateCalculatorResultEmail(options: CalculatorEmailOptions): string {
  const { name, priceResult } = options;

  const includedRows = priceResult.features
    .map(
      (f) => `
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #374151;">
            <span style="color: #14B8A6; margin-right: 8px;">&#10003;</span> ${f}
          </td>
        </tr>`
    )
    .join('');

  const addonsSection = priceResult.addons.length > 0
    ? `
      <!-- Addons -->
      <tr>
        <td style="padding: 10px 30px 20px 30px;">
          <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #111827;">Doplňkové služby (individuální nabídka)</h3>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${priceResult.addons.map((a) => `
              <tr>
                <td style="padding: 6px 0; font-size: 14px; color: #374151;">
                  <span style="color: #14B8A6; margin-right: 8px;">&#10003;</span> ${a.label}
                </td>
              </tr>
            `).join('')}
          </table>
          <p style="margin: 10px 0 0 0; font-size: 13px; color: #6b7280;">
            Cenu doplňkových služeb vám připravíme individuálně při konzultaci.
          </p>
        </td>
      </tr>`
    : '';

  return `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Doporučený balíček | Weblyx</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;">
                Váš doporučený balíček
              </h1>
              <p style="color: #ccfbf1; margin: 10px 0 0 0; font-size: 15px;">
                Na základě vašich požadavků
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 30px 15px 30px;">
              <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.6;">
                Dobrý den ${name},
              </p>
              <p style="margin: 12px 0 0 0; font-size: 15px; color: #6b7280; line-height: 1.6;">
                děkujeme za vyplnění kalkulačky. Zde je přehled doporučeného balíčku pro váš projekt.
              </p>
            </td>
          </tr>

          <!-- Price Card -->
          <tr>
            <td style="padding: 15px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); border-radius: 12px; border: 2px solid #14B8A6;">
                <tr>
                  <td align="center" style="padding: 30px 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">
                      ${priceResult.packageName}
                    </p>
                    <p style="margin: 0; font-size: 36px; font-weight: 800; color: #0D9488;">
                      ${formatPrice(priceResult.price)} Kč
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: #6b7280;">
                      Jednorázová platba &bull; bez měsíčních poplatků
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Included Features -->
          <tr>
            <td style="padding: 20px 30px;">
              <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #111827;">V ceně zahrnuto</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${includedRows}
              </table>
            </td>
          </tr>

          ${addonsSection}

          <!-- Delivery -->
          <tr>
            <td style="padding: 10px 30px 25px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 15px;">
                <tr>
                  <td style="padding: 15px; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">
                      Odhadované dodání: <strong style="color: #111827;">${priceResult.deliveryDays.min}–${priceResult.deliveryDays.max} pracovních dní</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 10px 30px 30px 30px; text-align: center;">
              <p style="margin: 0 0 15px 0; font-size: 15px; color: #374151;">
                Chcete se domluvit na dalších krocích?
              </p>
              <a href="https://www.weblyx.cz/poptavka?ref=calculator" style="display: inline-block; background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);">
                Domluvit konzultaci zdarma
              </a>
              <p style="margin: 15px 0 0 0; font-size: 13px; color: #9ca3af;">
                nebo zavolejte: <a href="tel:+420702110166" style="color: #14B8A6; text-decoration: none;">+420 702 110 166</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.6;">
                Tato kalkulace je orientační. Přesnou cenu stanovíme po konzultaci.<br>
                <a href="https://www.weblyx.cz" style="color: #14B8A6; text-decoration: none;">Weblyx.cz</a> &bull; info@weblyx.cz
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateCalculatorAdminEmail(data: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectType: string;
  features: string[];
  designStyle?: string;
  brandingStatus?: string;
  timeline?: string;
  priceResult: PackageResult;
  leadId: string;
}): string {
  const addonsList = data.features.length > 0 ? data.features.join(', ') : 'Žádné';

  return `
<!DOCTYPE html>
<html lang="cs">
<head><meta charset="UTF-8"></head>
<body style="margin: 0; padding: 20px; font-family: 'Segoe UI', sans-serif; background: #f5f5f5;">
  <table width="600" cellpadding="0" cellspacing="0" style="margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <tr>
      <td style="background: #0D9488; padding: 20px 30px;">
        <h2 style="color: #fff; margin: 0; font-size: 20px;">Nový lead z kalkulačky</h2>
      </td>
    </tr>
    <tr>
      <td style="padding: 25px 30px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Jméno</td><td style="padding: 6px 0; font-weight: 600;">${data.name}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Email</td><td style="padding: 6px 0;"><a href="mailto:${data.email}" style="color: #14B8A6;">${data.email}</a></td></tr>
          ${data.phone ? `<tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Telefon</td><td style="padding: 6px 0;"><a href="tel:${data.phone}" style="color: #14B8A6;">${data.phone}</a></td></tr>` : ''}
          ${data.company ? `<tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Firma</td><td style="padding: 6px 0;">${data.company}</td></tr>` : ''}
          <tr><td colspan="2" style="padding: 12px 0 6px 0; border-top: 1px solid #e5e7eb;"></td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Balíček</td><td style="padding: 6px 0; font-weight: 600;">${data.priceResult.packageName}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Cena</td><td style="padding: 6px 0; font-weight: 700; color: #0D9488; font-size: 18px;">${formatPrice(data.priceResult.price)} Kč</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Doplňky</td><td style="padding: 6px 0;">${addonsList}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Lead ID</td><td style="padding: 6px 0; font-family: monospace; font-size: 12px;">${data.leadId}</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function formatPrice(price: number): string {
  return price.toLocaleString('cs-CZ');
}
