
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

        if (Array.isArray(data.categories)) return data.categories as T[];
        if (Array.isArray(data.products)) return data.products as T[];
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
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const [categoryError, setCategoryError] = useState(false);

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
    }


    function renderCategories(mobile = false) {
        return categories.map((category, index) => {
            const slug = category.slug || category.id;

            if (!slug) return null;

            return (
                <Link
                    key={String(slug || category._id || index)}
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

                <div className="hidden items-center gap-3 sm:flex">
                    <Link
                        href="/auth/sign-in"
                        className="rounded-lg border border-green-700 px-4 py-2 text-sm font-semibold text-green-800 transition hover:bg-green-50"
                    >
                        Sign in
                    </Link>

                    <Link
                        href="/auth/sign-up"
                        className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
                    >
                        Sign up
                    </Link>
                </div>

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
                        <div className="mb-4 flex flex-wrap gap-2">
                            <Link
                                href="/"
                                onClick={closeMenu}
                                className="rounded-lg border border-gray-100 bg-white px-3 py-2 text-sm font-semibold text-gray-700"
                            >
                                🏠 হোম
                            </Link>

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
                        </div>

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
                                                {product.categoryIcon || product.image || "🛒"}
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
