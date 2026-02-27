import { NextRequest, NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import { validateHoneypot, validateSubmissionTime } from '@/lib/security/honeypot';
import { nanoid } from 'nanoid';
import { sendEmail, EMAIL_CONFIG } from '@/lib/email/resend-client';
import { generateCalculatorResultEmail, generateCalculatorAdminEmail } from '@/lib/email/calculator-template';
import { calculatePrice, CalculateInput } from '@/lib/calculator/pricing-engine';
import { ProjectType, AddonService } from '@/lib/calculator/types';

const VALID_PROJECT_TYPES: ProjectType[] = ['landing', 'basic', 'standard'];
const VALID_ADDONS: AddonService[] = ['seo', 'lead-generation', 'email-marketing', 'ai-ads'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectType,
      addons,
      email,
      name,
      phone,
      company,
      gdprConsent,
      __form_timestamp,
    } = body;

    // Bot detection
    if (!validateHoneypot(body)) {
      return NextResponse.json(
        { success: true, priceResult: { packageName: 'Web', price: 9990, features: [], deliveryDays: { min: 5, max: 7 }, addons: [] } },
        { status: 200 }
      );
    }

    if (__form_timestamp && !validateSubmissionTime(__form_timestamp, 3)) {
      return NextResponse.json(
        { success: true, priceResult: { packageName: 'Web', price: 9990, features: [], deliveryDays: { min: 5, max: 7 }, addons: [] } },
        { status: 200 }
      );
    }

    // Validation
    if (!email || !name || !projectType || !gdprConsent) {
      return NextResponse.json(
        { error: 'Vyplňte prosím všechna povinná pole.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Neplatný formát emailu.' },
        { status: 400 }
      );
    }

    if (!VALID_PROJECT_TYPES.includes(projectType)) {
      return NextResponse.json({ error: 'Neplatný typ projektu.' }, { status: 400 });
    }

    // Filter valid addons
    const validAddons = Array.isArray(addons)
      ? addons.filter((a: string) => VALID_ADDONS.includes(a as AddonService))
      : [];

    // Calculate price
    const calcInput: CalculateInput = {
      projectType,
      addons: validAddons,
    };

    const priceResult = calculatePrice(calcInput);

    // Save lead to Turso
    const leadId = nanoid();
    const budgetRange = `${priceResult.price.toLocaleString('cs-CZ')} Kč`;
    const servicesJson = JSON.stringify(validAddons);
    const extraData = JSON.stringify({
      package: priceResult.packageName,
      price: priceResult.price,
      addons: validAddons,
    });

    await turso.execute({
      sql: `
        INSERT INTO leads (
          id, name, email, phone, company, project_type,
          budget_range, services, business_description, status, source,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())
      `,
      args: [
        leadId,
        name,
        email.toLowerCase().trim(),
        phone || null,
        company || null,
        projectType,
        budgetRange,
        servicesJson,
        extraData,
        'new',
        'calculator',
      ],
    });

    // Send email to client
    try {
      const clientHtml = generateCalculatorResultEmail({
        name,
        priceResult,
        projectType,
        features: validAddons,
      });

      await sendEmail({
        to: email,
        subject: `Váš doporučený balíček – ${priceResult.packageName} (${budgetRange})`,
        html: clientHtml,
      });
    } catch (emailError) {
      console.error('Failed to send client email:', emailError);
    }

    // Send admin notification
    try {
      const adminHtml = generateCalculatorAdminEmail({
        name,
        email,
        phone,
        company,
        projectType,
        features: validAddons,
        designStyle: 'undecided',
        brandingStatus: 'has-logo',
        timeline: 'normal',
        priceResult,
        leadId,
      });

      await sendEmail({
        to: EMAIL_CONFIG.adminEmail,
        subject: `Nový lead z kalkulačky – ${name} (${priceResult.packageName}, ${budgetRange})`,
        html: adminHtml,
        replyTo: email,
      });
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
    }

    return NextResponse.json({
      success: true,
      leadId,
      priceResult,
    });
  } catch (error) {
    console.error('Calculator API error:', error);
    return NextResponse.json(
      { error: 'Došlo k chybě. Zkuste to prosím znovu.' },
      { status: 500 }
    );
  }
}
