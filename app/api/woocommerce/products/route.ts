import { NextRequest, NextResponse } from "next/server";
import { getProducts, GetProductsParams } from "@/lib/woocommerce";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const per_page = searchParams.get("per_page")
      ? parseInt(searchParams.get("per_page")!, 10)
      : 10;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const slug = searchParams.get("slug") || undefined;
    const featured = searchParams.get("featured") === "true" ? true : undefined;

    const params: GetProductsParams = {
      page,
      per_page,
      category,
      search,
      slug,
      featured,
      status: "publish",
    };

    const products = await getProducts(params);
    return NextResponse.json({ success: true, data: products });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch products";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
