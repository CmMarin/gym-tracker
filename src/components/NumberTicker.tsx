"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function NumberTicker({ value }: { value: string | number }) {
  return (
    <span className="inline-flex overflow-hidden relative tabular-nums whitespace-pre">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={String(value)}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="inline-block origin-bottom leading-none"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
