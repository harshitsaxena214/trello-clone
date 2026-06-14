"use client";

import { motion } from "framer-motion";
import { ArrowRight, Layers } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  return (
    <motion.header
      className="mx-auto flex max-w-5xl items-center justify-between px-8 py-5"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-white">
          <Layers className="h-4 w-4 text-black" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-white">
          TaskFlow
        </span>
      </div>
      <nav className="flex items-center gap-3">
        <Link
          href="/sign-in"
          className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-1.5 rounded-md bg-white px-3.5 py-1.5 text-sm font-medium text-black hover:bg-zinc-200 transition-colors duration-200"
        >
          Get started <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </nav>
    </motion.header>
  );
}
