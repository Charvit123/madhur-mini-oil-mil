import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductDetailClient } from "./ProductDetailClient";

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ v?: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  try {
    const p = await api.product(slug);
    return { title: p.name, description: p.shortDescription, alternates: { canonical: `/product/${p.slug}` } };
  } catch { return { title: "Product" }; }
}

export default async function ProductPage({ params, searchParams }: Params) {
  const [{ slug }, { v }] = await Promise.all([params, searchParams]);

  let product;
  try {
    product = await api.product(slug);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  if (!product) notFound();

  const [reviews, related] = await Promise.all([api.reviews(product.id), api.related(product.id, 4)]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    brand: { "@type": "Brand", name: "Madhur Mini Oil Mill" },
    aggregateRating: product.ratingCount
      ? { "@type": "AggregateRating", ratingValue: product.ratingAverage, reviewCount: product.ratingCount }
      : undefined,
    offers: product.variants.map((variant) => ({
      "@type": "Offer", sku: variant.sku, price: variant.price, priceCurrency: "INR",
      availability: variant.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    })),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="shell">
        <Breadcrumb items={[["Home", "/"], ["Shop", "/shop"], [product.oil.name, `/shop/${product.oil.slug}`], [product.name]]} />
      </div>
      <ProductDetailClient product={product} initialVariantId={v ?? product.defaultVariantId ?? product.variants[0]?.id} reviews={reviews.items} />

      <section className="bg-paper-2 py-14">
        <div className="shell">
          <h2 className="mb-8 text-h2">Often bought together</h2>
          <ProductGrid variants={related} />
        </div>
      </section>
    </main>
  );
}
