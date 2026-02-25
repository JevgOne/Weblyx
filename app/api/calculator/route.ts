import { NextRequest, NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import { validateHoneypot, validateSubmissionTime } from '@/lib/security/honeypot';
import { nanoid } from 'nanoid';
import { sendEmail, EMAIL_CONFIG } from '@/lib/email/resend-client';
import { generateCalculatorResultEmail, generateCalculatorAdminEmail } from '@/lib/email/calculator-template';
import { calculatePrice, CalculateInput } from '@/lib/calculator/pricing-engine';
import { ProjectType, DesignStyle, BrandingStatus, Timeline } from '@/lib/calculator/types';

const VALID_PROJECT_TYPES: ProjectType[] = ['landing', 'basic', 'standard', 'eshop'];
const VALID_DESIGN_STYLES: DesignStyle[] = ['minimal', 'creative', 'corporate', 'undecided'];
const VALID_BRANDING: BrandingStatus[] = ['has-branding', 'has-logo', 'needs-everything'];
const VALID_TIMELINES: Timeline[] = ['urgent', 'normal', 'relaxed', 'flexible'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectType,
      features,
      designStyle,
      brandingStatus,
      timeline,
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
        { success: true, priceResult: { totalMin: 9990, totalMax: 14990 } },
        { status: 200 }
      );
    }

    if (__form_timestamp && !validateSubmissionTime(__form_timestamp, 3)) {
      return NextResponse.json(
        { success: true, priceResult: { totalMin: 9990, totalMax: 14990 } },
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

    // Calculate price
    const calcInput: CalculateInput = {
      projectType,
      features: Array.isArray(features) ? features : [],
      designStyle: VALID_DESIGN_STYLES.includes(designStyle) ? designStyle : 'undecided',
      brandingStatus: VALID_BRANDING.includes(brandingStatus) ? brandingStatus : 'has-logo',
      timeline: VALID_TIMELINES.includes(timeline) ? timeline : 'normal',
    };

    const priceResult = calculatePrice(calcInput);

    // Save lead to Turso
    const leadId = nanoid();
    const budgetRange = `${priceResult.totalMin.toLocaleString('cs-CZ')} – ${priceResult.totalMax.toLocaleString('cs-CZ')} Kč`;
    const servicesJson = JSON.stringify(features || []);
    const extraData = JSON.stringify({
      designStyle,
      brandingStatus,
      timeline,
      priceResult: { totalMin: priceResult.totalMin, totalMax: priceResult.totalMax },
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
        features: features || [],
      });

      await sendEmail({
        to: email,
        subject: `Vaše cenová kalkulace – ${budgetRange}`,
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
        features: features || [],
        designStyle,
        brandingStatus,
        timeline,
        priceResult,
        leadId,
      });

      await sendEmail({
        to: EMAIL_CONFIG.adminEmail,
        subject: `Nový lead z kalkulačky – ${name} (${budgetRange})`,
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
