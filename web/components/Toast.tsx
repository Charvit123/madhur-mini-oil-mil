"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useSyncExternalStore } from "react";

type Tone = "default" | "ok" | "error";
interface ToastItem { id: number; message: string; tone: Tone }

let items: ToastItem[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function toast(message: string, tone: Tone = "default") {
  const id = Date.now() + Math.random();
  items = [...items, { id, message, tone }];
  emit();
  setTimeout(() => { items = items.filter((t) => t.id !== id); emit(); }, 2600);
}

export function Toaster() {
  const list = useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => items, () => items
  );
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[120]
                    flex flex-col items-center gap-2.5 sm:inset-x-auto sm:right-6 sm:items-end" aria-live="polite">
      <AnimatePresence>
        {list.map((t) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22 }}
            className={`rounded-2xl px-4 py-3 text-sm text-[#F6EEE2] shadow-lift
                        ${t.tone === "ok" ? "bg-[#2F4A31]" : t.tone === "error" ? "bg-err" : "bg-ink"}`}>
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
