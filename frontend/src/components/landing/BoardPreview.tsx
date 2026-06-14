"use client";

import { motion } from "framer-motion";

const COLUMNS = [
  {
    title: "To Do",
    count: 4,
    items: [
      "Design system audit",
      "Pricing page copy",
      "User research interviews",
      "Refactor billing",
    ],
  },
  {
    title: "In Progress",
    count: 2,
    items: ["Onboarding flow v2", "Mobile nav polish"],
  },
  {
    title: "Done",
    count: 3,
    items: ["Auth migration", "Dashboard redesign", "Q3 roadmap"],
  },
];

export function BoardPreview() {
  return (
    <motion.div
      className="mb-24 rounded-2xl border border-white/[0.08] bg-[#111111] p-4 sm:p-6"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.55 }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {COLUMNS.map((col, colIndex) => (
          <motion.div
            key={col.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
              delay: 0.7 + colIndex * 0.1,
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">
                {col.title}
              </span>
              <span className="text-sm text-zinc-600">{col.count}</span>
            </div>
            <div className="flex flex-col gap-2">
              {col.items.map((it, cardIndex) => (
                <motion.div
                  key={it}
                  className="rounded-lg border border-white/[0.06] bg-[#1a1a1a] px-4 py-3 hover:border-white/[0.12] hover:bg-[#202020] transition-colors duration-200 cursor-default"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    ease: "easeOut",
                    delay: 0.8 + colIndex * 0.1 + cardIndex * 0.06,
                  }}
                >
                  <p className="text-sm text-zinc-300">{it}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
