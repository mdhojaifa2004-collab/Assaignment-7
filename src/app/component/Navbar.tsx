"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "../../app/lib/auth-client";


const API = "https://openapi.programming-hero.com/api/bazardor";

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

type User = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

type Product = {
  id?: number | string;
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
  change?: {
    dir?: string;
    pct?: number;
  };
};

function getArray<T>(json: unknown): T[] {
  if (Array.isArray(json)) return json as T[];

  if (!json || typeof json !== "object") return [];

  const obj = json as Record<string, unknown>;

  if (Array.isArray(obj.data)) return obj.data as T[];
  if (Array.isArray(obj.categories)) return obj.categories as T[];
  if (Array.isArray(obj.products)) return obj.products as T[];

  if (obj.data && typeof obj.data === "object") {
    const data = obj.data as Record<string, unknown>;

    if (Array.isArray(data.categories)) {
      return data.categories as T[];
    }

    if (Array.isArray(data.products)) {
      return data.products as T[];
    }
  }

  return [];
}

function categoryName(category: Category) {
  return (
    category.nameBn ||
    category.categoryNameBn ||
    category.name ||
    category.slug ||
    "ক্যাটাগরি"
  );
}

function categoryIcon(category: Category) {
  return category.categoryIcon || category.icon || "🛒";
}

function productName(product: Product) {
  return product.nameBn || product.name || product.slug || "পণ্য";
}

function productTrend(product: Product): "up" | "down" | "same" {
  if (
    product.change?.dir === "up" ||
    product.change?.dir === "down" ||
    product.change?.dir === "same"
  ) {
    return product.change.dir;
  }

  const today = Number(product.today ?? 0);
  const yesterday = Number(product.yesterday ?? today);

  if (today > yesterday) return "up";
  if (today < yesterday) return "down";

  return "same";
}

function getPercent(product: Product) {
  if (product.change?.pct != null) {
    return Math.abs(Number(product.change.pct));
  }

  const today = Number(product.today ?? 0);
  const yesterday = Number(product.yesterday ?? 0);

  if (yesterday === 0) return 0;

  return Math.abs(((today - yesterday) / yesterday) * 100);
}

export default function Navbar() {
  const router = useRouter();

  const { data: session, isPending } = useSession();
  const user = (session as unknown as { user: User } | null)?.user;

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryError, setCategoryError] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Load categories and products
  useEffect(() => {
    let cancelled = false;

    async function loadNavbarData() {
      try {
        const [categoryResponse, productResponse] = await Promise.all([
          fetch(`${API}/categories`),
          fetch(`${API}/products`),
        ]);

        if (categoryResponse.ok) {
          const categoryJson: unknown = await categoryResponse.json();
          const categoryList = getArray<Category>(categoryJson);

          if (!cancelled) {
            setCategories(categoryList);
            setCategoryError(categoryList.length === 0);
          }
        } else if (!cancelled) {
          setCategoryError(true);
        }

        if (productResponse.ok) {
          const productJson: unknown = await productResponse.json();

          if (!cancelled) {
            setProducts(getArray<Product>(productJson));
          }
        }
      } catch (error) {
        console.error("Navbar data loading error:", error);

        if (!cancelled) {
          setCategoryError(true);
        }
      }
    }

    loadNavbarData();

    return () => {
      cancelled = true;
    };
  }, []);

  const trendingProducts = products.filter(
    (product) => productTrend(product) !== "same"
  );

  function closeMenu() {
    setMenuOpen(false);
    setProfileMenuOpen(false);
  }

  // Sign out
  async function handleSignOut() {
    try {
      setLoggingOut(true);

      await signOut({});

      setProfileMenuOpen(false);
      setMenuOpen(false);

      router.refresh();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
      alert("লগআউট করা যায়নি। আবার চেষ্টা করো।");
    } finally {
      setLoggingOut(false);
    }
  }

  // Profile component
  function renderProfile() {
    if (isPending) {
      return (
        <span className="text-sm text-gray-500">
          Loading...
        </span>
      );
    }

    if (!user) {
      return (
        <>
          <Link
            href="/auth/sign-in"
            onClick={closeMenu}
            className="rounded-lg border border-green-700 px-4 py-2 text-sm font-semibold text-green-800 transition hover:bg-green-50"
          >
            Sign in
          </Link>

          <Link
            href="/auth/sign-up"
            onClick={closeMenu}
            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
          >
            Sign up
          </Link>
        </>
      );
    }

    return (
      <>
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileMenuOpen((previous) => !previous)}
            aria-expanded={profileMenuOpen}
            className="flex max-w-full items-center gap-2 rounded-lg border border-green-200 bg-white px-3 py-2 text-left transition hover:bg-green-50"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-xl">
              👤
            </span>

            <span className="min-w-0">
              <span className="block max-w-36 truncate text-sm font-bold text-gray-800">
                {user.name || "My Profile"}
              </span>

              <span className="block max-w-36 truncate text-xs text-gray-500">
                {user.email}
              </span>
            </span>

            <span className="text-xs text-gray-500">
              {profileMenuOpen ? "▲" : "▼"}
            </span>
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 top-full z-[60] mt-2 w-56 rounded-xl border border-gray-100 bg-white p-2 shadow-xl">
              <div className="border-b border-gray-100 px-3 py-3">
                <p className="truncate text-sm font-bold text-gray-800">
                  {user.name || "User"}
                </p>

                <p className="truncate text-xs text-gray-500">
                  {user.email}
                </p>
              </div>

              <Link
                href="/profile"
                onClick={() => setProfileMenuOpen(false)}
                className="mt-1 block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-700"
              >
                👤 My Profile
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={loggingOut}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loggingOut ? "Signing out..." : "🚪 Sign out"}
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

  // Category links
  function renderCategories(mobile = false) {
    return categories.map((category, index) => {
      const slug = category.slug || category.id || category._id;

      if (!slug) return null;

      return (
        <Link
          key={String(slug || index)}
          href={`/category/${encodeURIComponent(String(slug))}`}
          onClick={mobile ? closeMenu : undefined}
          className={
            mobile
              ? "rounded-lg border border-gray-100 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-green-700"
              : "shrink-0 text-sm font-semibold text-gray-700 transition hover:text-green-700"
          }
        >
          {categoryIcon(category)} {categoryName(category)}
        </Link>
      );
    });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#e4ebe5] bg-white">
      {/* Main Navbar */}
      <div className="mx-auto flex min-h-[64px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-2"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-700 text-lg">
            🛒
          </span>

          <span>
            <span className="block text-base font-extrabold text-[#25372b]">
              বাজার দর
            </span>

            <span className="block text-[10px] text-gray-500">
              বাংলাদেশের বাজারের তথ্য
            </span>
          </span>
        </Link>

        {/* Desktop Auth / Profile */}
        <div className="hidden items-center gap-3 sm:flex">
          {renderProfile()}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen((previous) => !previous)}
          aria-label={menuOpen ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
          aria-expanded={menuOpen}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xl text-gray-700 sm:hidden"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Desktop Category Navigation */}
      <nav className="border-t border-gray-100">
        <div className="mx-auto hidden max-w-7xl items-center gap-5 overflow-x-auto whitespace-nowrap px-4 py-3 sm:flex sm:px-6">
          <Link
            href="/"
            className="shrink-0 text-sm font-semibold text-gray-700 hover:text-green-700"
          >
            🏠 হোম
          </Link>

          {renderCategories()}

          {categoryError && (
            <span className="text-xs text-red-500">
              ক্যাটাগরি লোড হয়নি। পেজ রিফ্রেশ করো।
            </span>
          )}
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="border-t border-gray-100 bg-[#fbfdfb] px-4 py-4 sm:hidden">
            {/* Mobile Home and Auth */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Link
                href="/"
                onClick={closeMenu}
                className="rounded-lg border border-gray-100 bg-white px-3 py-2 text-sm font-semibold text-gray-700"
              >
                🏠 হোম
              </Link>

              {isPending ? (
                <span className="px-3 py-2 text-sm text-gray-500">
                  Loading...
                </span>
              ) : user ? (
                <div className="w-full pt-2">
                  <div className="mb-3 flex items-center gap-3 rounded-xl border border-green-100 bg-white p-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-xl">
                      👤
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-800">
                        {user.name || "My Profile"}
                      </p>

                      <p className="truncate text-xs text-gray-500">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/profile"
                      onClick={closeMenu}
                      className="rounded-lg border border-green-700 px-3 py-2 text-sm font-semibold text-green-800 hover:bg-green-50"
                    >
                      👤 My Profile
                    </Link>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={loggingOut}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {loggingOut ? "Signing out..." : "🚪 Sign out"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/sign-in"
                    onClick={closeMenu}
                    className="rounded-lg border border-green-700 px-3 py-2 text-sm text-green-800"
                  >
                    Sign in
                  </Link>

                  <Link
                    href="/auth/sign-up"
                    onClick={closeMenu}
                    className="rounded-lg bg-green-700 px-3 py-2 text-sm text-white"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>

            {/* Categories */}
            <p className="mb-2 text-xs font-bold text-gray-500">
              ক্যাটাগরি
            </p>

            <div className="grid grid-cols-2 gap-2">
              {renderCategories(true)}
            </div>

            {categoryError && (
              <p className="mt-3 text-xs text-red-500">
                ক্যাটাগরি লোড হয়নি। API পরীক্ষা করো।
              </p>
            )}
          </div>
        )}
      </nav>

      {/* Scrolling Price Ticker */}
      <div className="w-full overflow-hidden border-t border-[#e8eee8] bg-[#f7faf7]">
        {trendingProducts.length > 0 ? (
          <div className="price-ticker flex w-max">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className="price-ticker-group flex shrink-0 items-center gap-7 py-2.5 pr-7"
              >
                {trendingProducts.map((product, index) => {
                  const trend = productTrend(product);

                  return (
                    <span
                      key={`${copy}-${product.id ?? product.slug ?? index}`}
                      className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xs"
                    >
                      <span>
                        {product.categoryIcon || "🛒"}
                      </span>

                      <span className="text-gray-700">
                        {productName(product)}
                      </span>

                      <span className="font-bold text-gray-800">
                        ৳
                        {Number(product.today ?? 0).toLocaleString("en-BD")}
                      </span>

                      <span
                        className={
                          trend === "up"
                            ? "font-bold text-red-600"
                            : "font-bold text-green-700"
                        }
                      >
                        {trend === "up" ? "▲" : "▼"}{" "}
                        {getPercent(product).toFixed(1)}%
                      </span>
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <p className="py-2.5 text-center text-xs text-gray-500">
            পণ্যের দামের তথ্য লোড হচ্ছে...
          </p>
        )}
      </div>
    </header>
  );
}