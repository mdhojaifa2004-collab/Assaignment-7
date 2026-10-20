"use client";

import Image from "next/image";

export default function HeroSection() {
  const today = new Intl.DateTimeFormat("bn-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <section className="mx-auto mt-4 w-full max-w-7xl px-4 sm:px-6">
      <div className="grid min-h-[215px] grid-cols-1 items-center gap-5 overflow-hidden rounded-[20px] border border-[#e0e9e1] bg-[#f9fcf9] px-5 py-6 sm:px-8 md:grid-cols-[1fr_220px] md:py-5">
        
        {/* Left Side: Date, Title, Description, Button */}
        <div className="flex flex-col items-start">
          <span className="rounded-full bg-[#e3f5e8] px-3 py-1 text-xs font-semibold text-[#078443]">
            {today}
          </span>

          <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-[#202b23] sm:text-3xl">
            আজকের বাজারের দাম এক নজরে
          </h1>

          <p className="mt-3 max-w-[520px] text-sm leading-6 text-[#737b75]">
            চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলার দাম —
            বাজারভিত্তিক বিস্তারিত, গড়, সর্বনিম্ন-সর্বোচ্চ এবং দামের
            পরিবর্তন এক জায়গায়।
          </p>

          <a
            href="/products"
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#078b43] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#067638]"
          >
            সব পণ্য দেখুন
          </a>
        </div>

        {/* Right Side: Hero Image */}
        <div className="relative mx-auto h-[150px] w-full max-w-[200px] md:h-[170px] md:w-[200px]">
          <Image
            src="/bazar-hero.png"
            alt="তাজা সবজির ঝুড়ি"
            fill
            priority
            sizes="(max-width: 768px) 200px, 220px"
            className="object-contain"
          />
        </div>

      </div>
    </section>
  );
}
