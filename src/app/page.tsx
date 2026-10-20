
"use client";


import Link from "next/link";
import { useEffect, useState } from "react";
import HeroSection from "./component/HeroSection";

const API = "https://openapi.programming-hero.com/api/bazardor";

type Product = {
  id: number | string;
  slug?: string;
  nameBn?: string;
  name?: string;
  category?: string;
  categoryNameBn?: string;
  categoryIcon?: string;
  unit?: string;
  image?: string;
  today?: number;
  yesterday?: number;
  lastWeek?: number;
  lastMonth?: number;
  change?: {
    dir?: "up" | "down" | "same";
    pct?: number;
  };
  price?: number;
  [key: string]: unknown;
};

function getProducts(response: unknown): Product[] {
  if (Array.isArray(response)) {
    return response as Product[];
  }

  if (response && typeof response === "object") {
    const result = response as Record<string, unknown>;

    if (Array.isArray(result.data)) {
      return result.data as Product[];
    }

    if (Array.isArray(result.products)) {
      return result.products as Product[];
    }

    if (result.data && typeof result.data === "object") {
      const data = result.data as Record<string, unknown>;

      if (Array.isArray(data.products)) {
        return data.products as Product[];
      }
    }
  }

  return [];
}

function getName(product: Product) {
  return product.nameBn || product.name || "পণ্যের নাম নেই";
}

function getIcon(product: Product) {
  return product.categoryIcon || product.image || "🛒";
}

function getPrice(product: Product) {
  return Number(product.today ?? product.price ?? 0);
}

function getChange(product: Product) {
  return Number(
    product.change?.pct ??
      (product.today != null && product.yesterday != null && product.yesterday !== 0
        ? ((product.today - product.yesterday) / product.yesterday) * 100
        : 0)
  );
}

function getTrend(product: Product): "up" | "down" | "same" {
  if (product.change?.dir === "up" || product.change?.dir === "down") {
    return product.change.dir;
  }

  const today = Number(product.today ?? product.price ?? 0);
  const yesterday = Number(product.yesterday ?? today);

  if (today > yesterday) return "up";
  if (today < yesterday) return "down";

  return "same";
}


function ProductCard({ product }: { product: Product }) {
  const trend = getTrend(product);
  const change = Math.abs(getChange(product));
  const productId = product.id ?? product.slug;

  return (
    <Link
      href={
        productId != null
          ? `/product/${encodeURIComponent(String(productId))}`
          : "#"
      }
      className="block rounded-2xl border border-[#e4ebe4] bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
      aria-label={`${getName(product)}-এর বিস্তারিত দেখুন`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f0f6ed] text-3xl">
          {getIcon(product)}
        </div>

        {trend !== "same" && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              trend === "up"
                ? "bg-red-50 text-red-600"
                : "bg-green-50 text-green-700"
            }`}
          >
            {trend === "up" ? "▲" : "▼"} {change.toFixed(1)}%
          </span>
        )}
      </div>

      <h3 className="mt-3 line-clamp-1 text-base font-bold text-[#25372b]">
        {getName(product)}
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        {product.categoryNameBn || product.category || "অন্যান্য"}
      </p>

      <div className="mt-4">
        <p className="text-xl font-extrabold text-[#244c32]">
          ৳{getPrice(product).toLocaleString("en-BD")}
          <span className="ml-1 text-xs font-medium text-gray-500">
            /{product.unit || "টি"}
          </span>
        </p>
      </div>

      {product.yesterday != null && (
        <p className="mt-2 text-xs text-gray-500">
          গতকাল: ৳
          {Number(product.yesterday).toLocaleString("en-BD")}
        </p>
      )}

      <p className="mt-3 border-t border-gray-100 pt-3 text-xs font-semibold text-green-700">
        বিস্তারিত দেখুন →
      </p>
    </Link>
  );
}


function ProductSection({
  title,
  products,
  type,
}: {
  title: string;
  products: Product[];
  type: "up" | "down" | "all";
}) {
  const isUp = type === "up";
  const isDown = type === "down";

  return (
    <section className="mb-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-[#0e7e31] sm:text-2xl">
          {title}
        </h2>

        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            isUp
              ? "bg-red-50 text-red-600"
              : isDown
                ? "bg-green-50 text-green-700"
                : "bg-white text-green-600"
          }`}
        >
          {products.length}টি পণ্য
        </span>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {products.map((product, index) => (
            <ProductCard
              key={`${product.id ?? product.slug ?? getName(product)}-${index}`}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-6 text-center text-sm text-gray-500">
          {type === "all"
            ? "কোনো পণ্য পাওয়া যায়নি।"
            : "এই মুহূর্তে এই সেকশনে কোনো পণ্য পাওয়া যায়নি।"}
        </div>
      )}
    </section>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API}/products`);

        if (!response.ok) {
          throw new Error("পণ্যের তথ্য লোড করা যায়নি।");
        }

        const json: unknown = await response.json();
        const list = getProducts(json);

        setProducts(list);

        if (list.length === 0) {
          setError("API থেকে পণ্যের তালিকা পাওয়া যায়নি।");
        }
      } catch (err) {
        console.error("BazarDor API error:", err);
        setError("পণ্য লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করো।");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const increasedProducts = products
    .filter((product) => getTrend(product) === "up")
    .slice(0, 6);

  const decreasedProducts = products
    .filter((product) => getTrend(product) === "down")
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-[#f2f7f3]">
      <HeroSection />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex min-h-48 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#dce8dc] border-t-[#2d7041]" />
              <p className="mt-4 text-sm text-gray-600">
                পণ্যের তথ্য লোড হচ্ছে...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-white p-6 text-center">
            <p className="font-semibold text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-[#285c37] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1e482b]"
            >
              আবার চেষ্টা করো
            </button>
          </div>
        ) : (
          <>
            <ProductSection
              title="▲ আজ দাম বেড়েছে"
              products={increasedProducts}
              type="up"
            />

            <ProductSection
              title="▼ আজ দাম কমেছে"
              products={decreasedProducts}
              type="down"
            />

            <ProductSection
              title="সব পণ্য"
              products={products}
              type="all"
            />
          </>
        )}
      </div>
    </main>
  );
}
