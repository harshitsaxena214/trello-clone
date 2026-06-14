"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, Layers, Lock } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Fast by default",
    desc: "Keyboard-friendly, instant interactions, zero loading spinners.",
  },
  {
    icon: Layers,
    title: "Just enough structure",
    desc: "Boards, columns, cards. The right primitives, none of the bloat.",
  },
  {
    icon: Lock,
    title: "Private by design",
    desc: "Your boards belong to you. Strict per-user access from day one.",
  },
];

export function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="grid gap-4 pb-24 md:grid-cols-3">
      {FEATURES.map((f, i) => (
        <motion.div
          key={f.title}
          className="rounded-2xl border border-white/[0.06] bg-[#111111] p-8 hover:border-white/[0.12] transition-colors duration-300"
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.12 }}
        >
          <motion.div
            className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-[#1a1a1a]"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : {}}
            transition={{
              duration: 0.4,
              ease: "easeOut",
              delay: 0.1 + i * 0.12,
            }}
          >
            <f.icon className="h-5 w-5 text-zinc-300" />
          </motion.div>
          <h3 className="mb-2 text-sm font-semibold text-white">{f.title}</h3>
          <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
        </motion.div>
      ))}
    </section>
  );
}
