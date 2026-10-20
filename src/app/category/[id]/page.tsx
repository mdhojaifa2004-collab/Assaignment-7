
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const API = "https://openapi.programming-hero.com/api/bazardor";

type Product = {
  id: number | string;
  slug?: string;
  nameBn?: string;
  name?: string;
  category?: string;
  categoryNameBn?: string;
  categoryIcon?: string;
  image?: string;
  unit?: string;
  today?: number;
  yesterday?: number;
  lastWeek?: number;
  lastMonth?: number;
  change?: {
    dir?: "up" | "down" | "same";
    pct?: number;
  };
  price?: number;
};

type Category = {
  id?: number | string;
  _id?: string;
  slug?: string;
  name?: string;
  nameBn?: string;
  categoryNameBn?: string;
  icon?: string;
  categoryIcon?: string;
};

function getList<T>(json: unknown): T[] {
  if (Array.isArray(json)) return json as T[];

  if (!json || typeof json !== "object") return [];

  const obj = json as Record<string, unknown>;

  if (Array.isArray(obj.data)) return obj.data as T[];
  if (Array.isArray(obj.products)) return obj.products as T[];
  if (Array.isArray(obj.categories)) return obj.categories as T[];

  if (obj.data && typeof obj.data === "object") {
    const data = obj.data as Record<string, unknown>;

    if (Array.isArray(data.products)) {
      return data.products as T[];
    }

    if (Array.isArray(data.categories)) {
      return data.categories as T[];
    }
  }

  return [];
}

function getPrice(product: Product): number {
  return Number(product.today ?? product.price ?? 0);
}

function getTrend(product: Product): "up" | "down" | "same" {
  if (
    product.change?.dir === "up" ||
    product.change?.dir === "down" ||
    product.change?.dir === "same"
  ) {
    return product.change.dir;
  }

  const today = getPrice(product);
  const yesterday = Number(product.yesterday ?? today);

  if (today > yesterday) return "up";
  if (today < yesterday) return "down";

  return "same";
}

function getPercent(product: Product): number {
  if (product.change?.pct != null) {
    return Math.abs(Number(product.change.pct));
  }

  const today = getPrice(product);
  const yesterday = Number(product.yesterday ?? 0);

  if (yesterday === 0) return 0;

  return Math.abs(((today - yesterday) / yesterday) * 100);
}

function ProductCard({ product }: { product: Product }) {
  const trend = getTrend(product);

  const productId = product.id ?? product.slug;

  return (
    <Link
      href={`/product/${encodeURIComponent(String(productId))}`}
      className="block rounded-xl border border-[#e3eae4] bg-[#fbfdfb] p-3 transition hover:-translate-y-0.5 hover:shadow-md sm:p-4"
      aria-label={`${product.nameBn || product.name || "পণ্য"}-এর বিস্তারিত দেখুন`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eef3ee] text-xl">
          {product.categoryIcon || product.image || "🛒"}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold text-[#27352b] sm:text-base">
            {product.nameBn || product.name || "পণ্যের নাম"}
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            প্রতি {product.unit || "টি"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-2">
        <div>
          <p className="text-[11px] text-gray-500">আজকের দাম</p>

          <p className="mt-0.5 text-base font-extrabold text-[#263a2b] sm:text-lg">
            ৳{getPrice(product).toLocaleString("en-BD")}
            <span className="ml-1 text-xs font-medium text-gray-500">
              টাকা
            </span>
          </p>
        </div>

        {trend === "up" && (
          <span className="shrink-0 rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600 sm:text-xs">
            ▲ {getPercent(product).toFixed(1)}%
          </span>
        )}

        {trend === "down" && (
          <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-700 sm:text-xs">
            ▼ {getPercent(product).toFixed(1)}%
          </span>
        )}

        {trend === "same" && (
          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-500">
            — ০.০%
          </span>
        )}
      </div>

      {product.yesterday != null && (
        <p className="mt-2 text-xs text-gray-500">
          গতকাল: ৳
          {Number(product.yesterday).toLocaleString("en-BD")}
        </p>
      )}

      <p className="mt-4 border-t border-[#edf1ed] pt-3 text-xs font-semibold text-[#39804a]">
        বিস্তারিত দেখুন →
      </p>
    </Link>
  );
}

export default function CategoryPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sort, setSort] = useState("default");
  const [trendFilter, setTrendFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [productResponse, categoryResponse] = await Promise.all([
          fetch(
            `${API}/products?category=${encodeURIComponent(id)}`
          ),
          fetch(`${API}/categories`),
        ]);

        if (!productResponse.ok) {
          throw new Error("পণ্যের তথ্য পাওয়া যায়নি।");
        }

        const productJson: unknown = await productResponse.json();
        const productList = getList<Product>(productJson);

        let categoryList: Category[] = [];

        if (categoryResponse.ok) {
          const categoryJson: unknown = await categoryResponse.json();
          categoryList = getList<Category>(categoryJson);
        }

        if (!cancelled) {
          setProducts(productList);
          setCategories(categoryList);
        }
      } catch (err) {
        console.error("Category loading error:", err);

        if (!cancelled) {
          setError("পণ্য লোড করা যায়নি। আবার চেষ্টা করো।");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const category = categories.find((item) => item.slug === id);

  const title =
    category?.nameBn ||
    category?.categoryNameBn ||
    category?.name ||
    products[0]?.categoryNameBn ||
    id;

  const icon =
    category?.categoryIcon ||
    category?.icon ||
    products[0]?.categoryIcon ||
    "🛒";

  const visibleProducts = useMemo(() => {
    let result = [...products];

    if (trendFilter !== "all") {
      result = result.filter(
        (product) => getTrend(product) === trendFilter
      );
    }

    if (sort === "low") {
      result.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sort === "high") {
      result.sort((a, b) => getPrice(b) - getPrice(a));
    } else if (sort === "up") {
      result.sort((a, b) => getPercent(b) - getPercent(a));
    } else if (sort === "down") {
      result.sort((a, b) => getPercent(a) - getPercent(b));
    }

    return result;
  }, [products, sort, trendFilter]);

  return (
    <main className="flex min-h-[calc(100vh-150px)] flex-col bg-[#f0f5f0]">
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-7">
        {/* Category Header */}
        <section className="flex items-center gap-3 rounded-xl border border-[#e3eae4] bg-[#fbfdfb] px-4 py-4 sm:px-5">
          <span className="text-3xl">{icon}</span>

          <div>
            <h1 className="text-xl font-extrabold text-[#29382d] sm:text-2xl">
              {title}
            </h1>

            <p className="mt-1 text-xs text-gray-500">
              প্রতি পণ্যের বাজারদর ও পরিবর্তন
            </p>
          </div>
        </section>

        {/* Sorting and Filtering */}
        <section className="mt-3 flex flex-wrap items-center justify-end gap-3 rounded-xl border border-[#e3eae4] bg-[#fbfdfb] px-3 py-3">
          <label className="flex items-center gap-2 text-xs text-gray-500">
            সাজানো

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="select select-sm max-w-48 border-gray-200 bg-white text-xs text-gray-700"
            >
              <option value="default">ডিফল্ট</option>
              <option value="low">দাম: কম থেকে বেশি</option>
              <option value="high">দাম: বেশি থেকে কম</option>
              <option value="up">দাম বৃদ্ধি: বেশি আগে</option>
              <option value="down">দাম বৃদ্ধি: কম আগে</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-xs text-gray-500">
            ফিল্টার

            <select
              value={trendFilter}
              onChange={(event) => setTrendFilter(event.target.value)}
              className="select select-sm max-w-40 border-gray-200 bg-white text-xs text-gray-700"
            >
              <option value="all">সব পণ্য</option>
              <option value="up">দাম বেড়েছে</option>
              <option value="down">দাম কমেছে</option>
              <option value="same">দাম অপরিবর্তিত</option>
            </select>
          </label>
        </section>

        <p className="mb-3 mt-5 text-xs text-gray-500">
          মোট {visibleProducts.length}টি পণ্য পাওয়া গেছে
        </p>

        {loading ? (
          <div className="py-16 text-center">
            <span className="loading loading-spinner loading-md text-success" />
            <p className="mt-3 text-sm text-gray-500">
              পণ্যের তথ্য লোড হচ্ছে...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-xl bg-white p-8 text-center text-sm text-red-600">
            {error}

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mx-auto mt-4 block rounded-lg bg-green-700 px-4 py-2 text-white hover:bg-green-800"
            >
              আবার চেষ্টা করো
            </button>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="rounded-xl border border-[#e3eae4] bg-white p-8 text-center text-sm text-gray-500">
            এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি।
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {visibleProducts.map((product, index) => (
              <ProductCard
                key={`${product.id ?? product.slug ?? index}`}
                product={product}
              />
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-[#e2e9e2] bg-[#fbfdfb]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-center text-[10px] text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>বাজার দর — বাংলাদেশের বাজারদর এক নজরে।</p>
          <p>সঠিক বাজার তথ্য, সচেতন কেনাকাটার সিদ্ধান্ত।</p>
        </div>
      </footer>
    </main>
  );
}
