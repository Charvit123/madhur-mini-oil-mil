export function LogoMark({ size = 40, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <circle cx={24} cy={24} r={23} fill={dark ? "#F6EEE2" : "#241B14"} />
      <path d="M24 9c6.4 7.1 10 12.2 10 17.2A10 10 0 0 1 14 26.2C14 21.2 17.6 16.1 24 9z" fill="#D79B1E" />
      <path d="M24 16.5c3.2 3.9 5 6.7 5 9.4a5 5 0 1 1-10 0c0-2.7 1.8-5.5 5-9.4z" fill={dark ? "#241B14" : "#FBF6EC"} />
      {!dark && <path d="M9 34c5 3 9.5 4.4 15 4.4S33 37 39 34" stroke="#5B6B3A" strokeWidth={2.4} fill="none" strokeLinecap="round" />}
    </svg>
  );
}

export function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex flex-col leading-none">
      <span className="font-display text-[1.22rem] font-bold tracking-tight" style={{ color: dark ? "#FFF3DE" : undefined }}>Madhur</span>
      <span className="text-[0.62rem] uppercase tracking-[0.22em]" style={{ color: dark ? "#9C8B78" : "var(--ink-3)" }}>Mini Oil Mill</span>
    </span>
  );
}
