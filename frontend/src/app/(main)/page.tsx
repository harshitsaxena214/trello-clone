"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/HeroSection";
import { BoardPreview } from "@/components/landing/BoardPreview";
import { Features } from "@/components/landing/FeaturesSection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Grid covers hero + board preview, fades on sides and bottom */}
      <div
        className="relative"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
          maskImage: `linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%),
                      linear-gradient(to bottom, black 70%, transparent 100%)`,
          WebkitMaskImage: `linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%),
                            linear-gradient(to bottom, black 70%, transparent 100%)`,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      >
        <main className="mx-auto max-w-5xl px-8">
          <Hero />
          <BoardPreview />
        </main>
      </div>

      <main className="mx-auto max-w-5xl px-8">
        <Features />
      </main>

      <Footer />
    </div>
  );
}
