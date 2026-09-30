import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: "var(--paper)", 2: "var(--paper-2)" },
        card: "var(--card)",
        ink: { DEFAULT: "var(--ink)", 2: "var(--ink-2)", 3: "var(--ink-3)" },
        olive: { DEFAULT: "var(--olive)", dark: "var(--olive-d)", tint: "var(--olive-tint)" },
        gold: { DEFAULT: "var(--gold)", dark: "var(--gold-d)", tint: "var(--gold-tint)" },
        kiln: { DEFAULT: "var(--kiln)", tint: "var(--kiln-tint)" },
        line: { DEFAULT: "var(--line)", 2: "var(--line-2)" },
        ok: "var(--ok)",
        warn: "var(--warn)",
        err: "var(--err)",
      },
      // Tailwind's default spacing scale only has half-steps at 0.5, 1.5, 2.5
      // and 3.5 — components throughout this app also use 4.5 through 9.5
      // (p-4.5, gap-6.5, mt-9.5, h-5.5, etc.), which without this extension
      // aren't real utilities: Tailwind silently emits no CSS for them, so
      // every one of those margins/paddings/gaps was collapsing to zero.
      // Same n × 0.25rem formula Tailwind itself uses for every other step.
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "6.5": "1.625rem",
        "7.5": "1.875rem",
        "8.5": "2.125rem",
        "9.5": "2.375rem",
      },
      borderRadius: { control: "999px", card: "14px", panel: "22px", xl2: "32px" },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        ui: ["var(--font-ui)", "ui-sans-serif", "system-ui"],
      },
      fontSize: {
        display: ["clamp(2.3rem, 7vw, 4.4rem)", { lineHeight: "1.04", letterSpacing: "-0.02em" }],
        h2: ["clamp(1.75rem, 4.2vw, 2.9rem)", { lineHeight: "1.1" }],
        h3: ["clamp(1.15rem, 2.2vw, 1.5rem)", { lineHeight: "1.2" }],
      },
      boxShadow: {
        card: "0 1px 2px rgb(58 42 24 / 0.06), 0 6px 18px -10px rgb(58 42 24 / 0.22)",
        lift: "0 18px 46px -22px rgb(58 42 24 / 0.45)",
      },
      maxWidth: { shell: "1280px", prose: "66ch" },
    },
  },
  plugins: [],
} satisfies Config;
