import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, projectType, budget, message } = body;

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Jméno, email a zpráva jsou povinné." },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Neplatný formát emailu." },
        { status: 400 }
      );
    }

    // Here you can integrate with email service (Resend, SendGrid, etc.)
    // For now, we'll just log and return success
    console.log("New contact form submission:", {
      name,
      email,
      phone,
      projectType,
      budget,
      message,
      timestamp: new Date().toISOString(),
    });

    // TODO: Send email notification
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'Weblyx <info@weblyx.cz>',
    //   to: 'info@weblyx.cz',
    //   subject: `Nová poptávka od ${name}`,
    //   html: `...`
    // });

    return NextResponse.json(
      {
        success: true,
        message: "Děkujeme za vaši zprávu! Ozveme se vám do 24 hodin.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Došlo k chybě při odesílání. Zkuste to prosím znovu." },
      { status: 500 }
    );
  }
}
