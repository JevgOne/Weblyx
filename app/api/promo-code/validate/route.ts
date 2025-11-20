import { NextRequest, NextResponse } from "next/server";
import { adminDbInstance } from "@/lib/firebase-admin";
import { PromoCode } from "@/types/cms";

export async function POST(request: NextRequest) {
  try {
    const { code, orderValue } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Kód je povinný." },
        { status: 400 }
      );
    }

    if (!adminDbInstance) {
      return NextResponse.json(
        { error: "Databáze není dostupná." },
        { status: 500 }
      );
    }

    // Find promo code (case insensitive)
    const snapshot = await adminDbInstance
      .collection('promo_codes')
      .where('code', '==', code.toUpperCase())
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: "Neplatný promo kód." },
        { status: 404 }
      );
    }

    const doc = snapshot.docs[0];
    const promoData = doc.data() as PromoCode;

    // Convert Firestore Timestamps to Dates
    const validFrom = promoData.validFrom instanceof Date
      ? promoData.validFrom
      : (promoData.validFrom as any).toDate();
    const validUntil = promoData.validUntil instanceof Date
      ? promoData.validUntil
      : (promoData.validUntil as any).toDate();

    const now = new Date();

    // Validate promo code
    if (!promoData.enabled) {
      return NextResponse.json(
        { error: "Tento promo kód je neaktivní." },
        { status: 400 }
      );
    }

    if (now < validFrom) {
      return NextResponse.json(
        { error: "Tento promo kód ještě není platný." },
        { status: 400 }
      );
    }

    if (now > validUntil) {
      return NextResponse.json(
        { error: "Platnost tohoto promo kódu již vypršela." },
        { status: 400 }
      );
    }

    if (promoData.usageLimit && promoData.usageCount >= promoData.usageLimit) {
      return NextResponse.json(
        { error: "Tento promo kód již byl vyčerpán." },
        { status: 400 }
      );
    }

    if (promoData.minOrderValue && orderValue < promoData.minOrderValue) {
      return NextResponse.json(
        {
          error: `Minimální hodnota objednávky pro tento kód je ${promoData.minOrderValue} Kč.`
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (promoData.discountType === 'percentage') {
      discountAmount = Math.round((orderValue * promoData.discountValue) / 100);
      // Apply max discount if specified
      if (promoData.maxDiscount && discountAmount > promoData.maxDiscount) {
        discountAmount = promoData.maxDiscount;
      }
    } else {
      // Fixed discount
      discountAmount = promoData.discountValue;
      // Don't allow discount to be more than order value
      if (discountAmount > orderValue) {
        discountAmount = orderValue;
      }
    }

    const finalPrice = Math.max(0, orderValue - discountAmount);

    return NextResponse.json(
      {
        success: true,
        data: {
          code: promoData.code,
          discountType: promoData.discountType,
          discountValue: promoData.discountValue,
          discountAmount,
          finalPrice,
          originalPrice: orderValue,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Promo code validation error:", error);
    return NextResponse.json(
      { error: "Došlo k chybě při validaci kódu." },
      { status: 500 }
    );
  }
}
