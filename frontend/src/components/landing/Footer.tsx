"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export function Footer() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.footer
      ref={ref}
      className="border-t border-white/[0.06]"
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-8 py-6 text-xs text-zinc-600">
        <span>© {new Date().getFullYear()} KanbaFlow</span>
        <span>Made for makers.</span>
      </div>
    </motion.footer>
  );
}
