"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import Link from "next/link";

export function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["simplified", "organized", "focused", "minimal", "collaborative"],
    [],
  );

  useEffect(() => {
    const id = setTimeout(() => {
      setTitleNumber((n) => (n === titles.length - 1 ? 0 : n + 1));
    }, 2000);
    return () => clearTimeout(id);
  }, [titleNumber, titles]);

  return (
    <div className="flex flex-col items-center gap-6 py-20 text-center">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black px-4 py-1.5 text-sm text-zinc-400">
          Simple project management, finally
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        className="text-5xl md:text-7xl max-w-3xl tracking-tighter font-semibold text-white leading-[1.1]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <span className="block">Project Management,</span>
        <span className="relative block h-[1.2em] overflow-hidden">
          {titles.map((title, index) => (
            <motion.span
              key={index}
              className="absolute inset-x-0 font-semibold text-white"
              initial={{ opacity: 0, y: 80 }}
              transition={{ type: "spring", stiffness: 50 }}
              animate={
                titleNumber === index
                  ? { y: 0, opacity: 1 }
                  : { y: titleNumber > index ? -80 : 80, opacity: 0 }
              }
            >
              {title}
            </motion.span>
          ))}
        </span>
      </motion.h1>

      {/* Subtext */}
      <motion.p
        className="text-base md:text-lg text-zinc-400 max-w-xl leading-relaxed"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        TaskFlow is a quiet, minimalist board for organizing work, tracking
        progress, and shipping with intent. No clutter, no plugins — just your
        work.
      </motion.p>

      {/* CTAs */}
      <motion.div
        className="flex flex-row gap-3"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
      >
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-transparent px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors duration-200"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-zinc-200 transition-colors duration-200"
        >
          Start for free <MoveRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </div>
  );
}
