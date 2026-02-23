import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getProductBrands, getProductCategories } from '@/lib/shoptet/products';

/**
 * GET /api/shoptet/products
 * Returns paginated, filtered products list
 * Query params: limit, offset, search, brand, category, stock, sortBy, sortOrder
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;

    const [result, brands, categories] = await Promise.all([
      getProducts({
        limit: Number(sp.get('limit')) || 20,
        offset: Number(sp.get('offset')) || 0,
        search: sp.get('search') || undefined,
        brand: sp.get('brand') || undefined,
        category: sp.get('category') || undefined,
        stock: (sp.get('stock') as 'inStock' | 'outOfStock' | 'all') || undefined,
        sortBy: sp.get('sortBy') || undefined,
        sortOrder: (sp.get('sortOrder') as 'asc' | 'desc') || undefined,
      }),
      getProductBrands(),
      getProductCategories(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: result.items,
        total: result.total,
        brands,
        categories,
      },
    });
  } catch (error: unknown) {
    console.error('❌ Products API error:', error);
    return NextResponse.json({
      success: true,
      data: { items: [], total: 0, brands: [], categories: [] },
    });
  }
}
