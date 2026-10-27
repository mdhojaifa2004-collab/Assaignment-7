"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "../../lib/auth-client";

const API = "https://openapi.programming-hero.com/api/bazardor";

type Market = {
  market: string;
  division: string;
  min: number;
  max: number;
};

type Product = {
  id: number | string;
  slug: string;
  nameBn: string;
  category: string;
  categoryNameBn: string;
  categoryIcon: string;
  unit: string;
  image: string;
  today: number;
  yesterday: number;
  lastWeek?: number;
  lastMonth?: number;
  change: {
    dir: "up" | "down" | "same";
    pct: number;
  };
  markets: Market[];
};

function taka(value: number) {
  return `${value.toLocaleString("bn-BD")} টাকা`;
}

export default function ProductDetailsPage() {
  // URL থেকে Product ID নেওয়া
  const params = useParams<{ id: string }>();
  const id = params.id;

  // Authentication
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Product State
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // লগইন না থাকলে Sign Up পেজে পাঠানো
  useEffect(() => {
    if (isPending) return;

    if (!session) {
      const callbackURL = `/product/${encodeURIComponent(id)}`;

      router.replace(
        `/auth/sign-up?callbackURL=${encodeURIComponent(callbackURL)}`
      );
    }
  }, [session, isPending, id, router]);

  // Product API থেকে তথ্য আনা
  useEffect(() => {
    // লগইন যাচাই শেষ না হওয়া পর্যন্ত API কল হবে না
    if (isPending || !session) return;

    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API}/products/${encodeURIComponent(id)}`
        );

        if (!response.ok) {
          throw new Error("পণ্যের তথ্য পাওয়া যায়নি।");
        }

        const json: unknown = await response.json();

        if (!json || typeof json !== "object") {
          throw new Error("API থেকে সঠিক তথ্য পাওয়া যায়নি।");
        }

        const root = json as Record<string, unknown>;

        const raw =
          root.data && typeof root.data === "object"
            ? (root.data as Record<string, unknown>)
            : root;

        if (!cancelled) {
          setProduct(raw as unknown as Product);
        }
      } catch (err) {
        console.error("Product details error:", err);

        if (!cancelled) {
          setError("পণ্যের তথ্য লোড করা যায়নি। আবার চেষ্টা করো।");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id, isPending, session]);

  // লগইন যাচাই
  if (isPending || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f0f5f0]">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-success" />

          <p className="mt-3 text-gray-600">
            লগইন যাচাই করা হচ্ছে...
          </p>
        </div>
      </main>
    );
  }

  // Product Loading
  if (loading) {
    return (
      <main className="min-h-screen bg-[#f0f5f0] px-4 py-20 text-center">
        <span className="loading loading-spinner loading-lg text-success" />

        <p className="mt-4 text-sm text-gray-500">
          পণ্যের বিস্তারিত লোড হচ্ছে...
        </p>
      </main>
    );
  }

  // Product Error
  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#f0f5f0] px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 text-center">
          <p className="font-semibold text-red-600">
            {error || "পণ্য পাওয়া যায়নি।"}
          </p>

          <Link
            href="/"
            className="btn btn-success btn-sm mt-5 text-white"
          >
            হোম পেজে ফিরে যাও
          </Link>
        </div>
      </main>
    );
  }

  // Market Information
  const markets = Array.isArray(product.markets)
    ? product.markets
    : [];

  // Price Trend
  const trend =
    product.change?.dir === "up" ||
    product.change?.dir === "down"
      ? product.change.dir
      : product.today > product.yesterday
        ? "up"
        : product.today < product.yesterday
          ? "down"
          : "same";

  const difference = Math.abs(product.today - product.yesterday);

  // Lowest Market
  const lowestMarket = markets.reduce<Market | null>(
    (best, market) =>
      !best || market.min < best.min ? market : best,
    null
  );

  // Highest Market
  const highestMarket = markets.reduce<Market | null>(
    (best, market) =>
      !best || market.max > best.max ? market : best,
    null
  );

  const lowestPrice =
    markets.length > 0
      ? Math.min(...markets.map((market) => Number(market.min)))
      : product.today;

  const highestPrice =
    markets.length > 0
      ? Math.max(...markets.map((market) => Number(market.max)))
      : product.today;

  // আনুমানিক গড় দাম
  const averagePrice =
    markets.length > 0
      ? markets.reduce(
          (sum, market) =>
            sum +
            (Number(market.min) + Number(market.max)) / 2,
          0
        ) / markets.length
      : product.today;

  return (
    <main className="min-h-screen bg-[#f0f5f0]">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-7">
        {/* Breadcrumb */}
        <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-green-700">
            হোম
          </Link>

          <span>›</span>

          <Link
            href={`/category/${encodeURIComponent(product.category)}`}
            className="hover:text-green-700"
          >
            {product.categoryNameBn}
          </Link>

          <span>›</span>

          <span className="font-semibold text-gray-700">
            {product.nameBn}
          </span>
        </nav>

        {/* Product Heading */}
        <section className="rounded-2xl border border-[#e3eae4] bg-[#fbfdfb] p-5 sm:p-7">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#eef3ee] text-5xl">
              {product.categoryIcon || product.image || "🛒"}
            </div>

            <div className="flex-1">
              <p className="text-sm text-gray-500">
                {product.categoryIcon} প্রতি{" "}
                {product.unit === "kg" ? "কেজি" : product.unit}
                {" · "}
                {product.categoryNameBn}
              </p>

              <h1 className="mt-2 text-2xl font-extrabold text-[#26382b] sm:text-3xl">
                {product.nameBn}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-500">
                  আজকের দাম
                </span>

                <span className="text-3xl font-extrabold text-[#244c32]">
                  {taka(product.today)}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    trend === "up"
                      ? "bg-red-50 text-red-600"
                      : trend === "down"
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {trend === "up"
                    ? "▲"
                    : trend === "down"
                      ? "▼"
                      : "—"}{" "}
                  {Math.abs(
                    Number(product.change?.pct ?? 0)
                  ).toFixed(1)}
                  %
                </span>
              </div>

              <p className="mt-3 text-sm text-gray-600">
                {trend === "up"
                  ? `গতকালের তুলনায় আজ দাম বেড়েছে ${taka(difference)}`
                  : trend === "down"
                    ? `গতকালের তুলনায় আজ দাম কমেছে ${taka(difference)}`
                    : "গতকালের তুলনায় আজ দাম অপরিবর্তিত"}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                টাকা /{" "}
                {product.unit === "kg" ? "কেজি" : product.unit}
              </p>
            </div>
          </div>
        </section>

        {/* Price Summary */}
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-extrabold text-[#26382b]">
            দামের সারসংক্ষেপ
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[#e3eae4] bg-white p-4">
              <p className="text-sm text-gray-500">
                সর্বনিম্ন দাম
              </p>

              <p className="mt-2 text-xl font-extrabold text-green-700">
                {taka(lowestPrice)}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                {lowestMarket?.market || "বাজারের তথ্য নেই"}
              </p>
            </div>

            <div className="rounded-xl border border-[#e3eae4] bg-white p-4">
              <p className="text-sm text-gray-500">
                সর্বাধিক দাম
              </p>

              <p className="mt-2 text-xl font-extrabold text-red-600">
                {taka(highestPrice)}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                {highestMarket?.market || "বাজারের তথ্য নেই"}
              </p>
            </div>

            <div className="rounded-xl border border-[#e3eae4] bg-white p-4">
              <p className="text-sm text-gray-500">
                আনুমানিক গড় দাম
              </p>

              <p className="mt-2 text-xl font-extrabold text-[#26382b]">
                {taka(Math.round(averagePrice * 100) / 100)}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                বাজারের সর্বনিম্ন ও সর্বাধিক দামের মধ্যবিন্দু থেকে হিসাব
              </p>
            </div>
          </div>
        </section>

        {/* Price Comparison */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-gray-800">
            দামের তুলনা
          </h2>

          <div className="space-y-3">
            {[
              ["আজকের দাম", product.today],
              ["গতকালের দাম", product.yesterday],
              ["গত সপ্তাহের দাম", product.lastWeek],
              ["গত মাসের দাম", product.lastMonth],
            ].map(([label, price]) => (
              <div
                key={String(label)}
                className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-4"
              >
                <span className="text-sm text-gray-600">
                  {label}
                </span>

                <span className="font-bold text-gray-800">
                  {price != null
                    ? taka(Number(price))
                    : "তথ্য নেই"}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs leading-5 text-gray-500">
            দামগুলো API-তে থাকা তথ্যের ভিত্তিতে দেখানো হচ্ছে।
          </p>
        </section>

        {/* Market Price Table */}
        <section className="mt-7">
          <div className="mb-3">
            <h2 className="text-lg font-extrabold text-[#000000] sm:text-xl">
              বাজারভিত্তিক আজকের দাম
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              প্রতি{" "}
              {product.unit === "kg" ? "কেজি" : product.unit}-এর হিসাবে
            </p>
          </div>

          {markets.length === 0 ? (
            <div className="rounded-xl bg-white p-6 text-center text-sm text-[#e70b0b]">
              এই পণ্যের বাজারভিত্তিক তথ্য পাওয়া যায়নি।
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#99e1ab] text-[#977a7a]">
              <table className="table table-zebra w-full">
                <thead>
                  <tr className="bg-[#97ef8b] font-bold text-[#080d08]">
                    <th>বাজার</th>
                    <th>বিভাগ</th>
                    <th className="text-right">সর্বাধিক</th>
                    <th className="text-right">সর্বনিম্ন</th>
                    <th className="text-right">আনুমানিক গড়</th>
                  </tr>
                </thead>

                <tbody>
                  {markets.map((market, index) => {
                    const marketAverage =
                      (Number(market.min) + Number(market.max)) / 2;

                    return (
                      <tr key={`${market.market}-${index}`}>
                        <td className="font-semibold text-[#988282]">
                          {market.market}
                        </td>

                        <td className="text-[#8b6464]">
                          {market.division}
                        </td>

                        <td className="text-right font-medium">
                          {taka(Number(market.max))}
                        </td>

                        <td className="text-right font-medium">
                          {taka(Number(market.min))}
                        </td>

                        <td className="text-right font-semibold text-[#e49191]">
                          {taka(
                            Math.round(marketAverage * 100) / 100
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Back Button */}
        <div className="mt-7">
          <Link
            href={`/category/${encodeURIComponent(product.category)}`}
            className="btn btn-outline btn-sm border-green-700 text-green-800 hover:bg-green-700 hover:text-white"
          >
            ← {product.categoryNameBn} ক্যাটাগরিতে ফিরে যাও
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#e2e9e2] bg-[#fbfdfb]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-center text-[10px] text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>বাজার দর — বাংলাদেশের বাজারদর এক নজরে।</p>
          <p>সঠিক বাজার তথ্য, সচেতন কেনাকাটার সিদ্ধান্ত।</p>
        </div>
      </footer>
    </main>
  );
}