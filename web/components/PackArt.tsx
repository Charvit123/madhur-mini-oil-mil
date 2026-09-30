"use client";
import { memo, useId } from "react";
import type { PackagingKind } from "@/lib/types";

/** Same colour math as the prototype's shade(hex, amt) helper. */
function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, v + amt)));
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
}

export interface PackArtProps {
  kind: PackagingKind;
  color: string;
  label?: string;
  className?: string;
}

/**
 * Ported 1:1 from the HTML prototype's packArt(type, oil, label) function —
 * same five cases, same coordinates. Kept as a component (not a string
 * builder) so it composes normally with layout/transition props elsewhere.
 * Add a new pack type by adding a `case` here; no other file needs to change.
 */
export const PackArt = memo(function PackArt({ kind, color, label = "", className }: PackArtProps) {
  const uid = useId().replace(/[:]/g, "");
  const dark = shade(color, -26);
  const light = shade(color, 26);
  const cap = "#2E4A6B";
  const metalId = `metal-${uid}`;
  const plasId = `plas-${uid}`;

  const Label = ({ x, y, w, h, r = 3 }: { x: number; y: number; w: number; h: number; r?: number }) => (
    <>
      <rect x={x} y={y} width={w} height={h} rx={r} fill="#FFF" opacity={0.93} />
      <rect x={x} y={y} width={w} height={h * 0.42} rx={r} fill={color} />
      <ellipse cx={x + w / 2} cy={y + h * 0.56} rx={w * 0.22} ry={h * 0.16} fill={light} />
      <rect x={x + w * 0.12} y={y + h * 0.78} width={w * 0.76} height={2.6} rx={1.3} fill="#D8CDBA" />
      <rect x={x + w * 0.12} y={y + h * 0.86} width={w * 0.5} height={2.6} rx={1.3} fill="#D8CDBA" />
    </>
  );

  let body: React.ReactNode;
  switch (kind) {
    case "TIN":
      body = (
        <>
          <rect x={26} y={46} width={88} height={126} rx={7} fill={`url(#${metalId})`} stroke="#9AA0A8" strokeWidth={1.2} />
          <rect x={34} y={54} width={72} height={110} rx={4} fill="#E9ECEF" opacity={0.55} />
          <Label x={40} y={62} w={60} h={92} r={4} />
          <rect x={60} y={26} width={22} height={22} rx={3} fill={`url(#${metalId})`} stroke="#9AA0A8" />
          <rect x={63} y={16} width={16} height={12} rx={3} fill={cap} />
          <path d="M86 40c14-2 18 4 14 10" stroke="#9AA0A8" strokeWidth={3} fill="none" strokeLinecap="round" />
        </>
      );
      break;
    case "BUCKET":
      body = (
        <>
          <path d="M32 58h76l-9 110a6 6 0 0 1-6 6H47a6 6 0 0 1-6-6z" fill={`url(#${plasId})`} />
          <path d="M32 58h76l-1.4 17H33.4z" fill={shade(color, -40)} opacity={0.55} />
          <Label x={44} y={84} w={52} h={62} r={4} />
          <rect x={28} y={48} width={84} height={13} rx={6} fill={shade(color, -34)} />
          <path d="M40 50C46 20 94 20 100 50" stroke="#3B4550" strokeWidth={4.5} fill="none" strokeLinecap="round" />
          <circle cx={70} cy={160} r={6} fill={shade(color, -44)} />
        </>
      );
      break;
    case "JAR":
      body = (
        <>
          <rect x={30} y={52} width={80} height={120} rx={14} fill={`url(#${plasId})`} />
          <path d="M110 76c12 2 14 28 0 32z" fill={shade(color, -36)} />
          <Label x={42} y={72} w={48} h={74} r={4} />
          <rect x={54} y={30} width={30} height={24} rx={5} fill={shade(color, -34)} />
          <rect x={52} y={22} width={34} height={11} rx={4} fill={cap} />
        </>
      );
      break;
    case "POUCH":
      body = (
        <>
          <path d="M36 44h68v122c0 6-4 10-10 10H46c-6 0-10-4-10-10z" fill={color} opacity={0.9} />
          <path d="M36 44h68l-6 10H42z" fill={shade(color, -30)} />
          <path d="M36 44l8-10h52l8 10z" fill={shade(color, -42)} />
          <Label x={48} y={74} w={44} h={62} r={3} />
          <path d="M40 48v118M100 48v118" stroke="#FFF" strokeWidth={1.5} opacity={0.35} />
        </>
      );
      break;
    default: // BOTTLE, CARTON
      body = (
        <>
          <path d="M52 56h36v14c0 8 14 14 14 30v58a12 12 0 0 1-12 12H50a12 12 0 0 1-12-12v-58c0-16 14-22 14-30z" fill={color} opacity={0.82} />
          <path d="M52 56h9v14c0 9-14 15-14 31v57h-9v-58c0-16 14-22 14-30z" fill="#FFF" opacity={0.32} />
          <Label x={46} y={104} w={48} h={50} r={4} />
          <rect x={52} y={36} width={36} height={22} rx={4} fill="#E7EAEE" />
          <rect x={49} y={24} width={42} height={16} rx={5} fill={cap} />
        </>
      );
  }

  return (
    <svg viewBox="0 0 140 190" role="img" aria-label={label} className={className}>
      <defs>
        <linearGradient id={metalId} x1="0" x2="1">
          <stop offset="0" stopColor="#C9CCD1" /><stop offset=".3" stopColor="#F2F4F6" />
          <stop offset=".62" stopColor="#D5D8DD" /><stop offset="1" stopColor="#AEB3BA" />
        </linearGradient>
        <linearGradient id={plasId} x1="0" x2="1">
          <stop offset="0" stopColor={dark} /><stop offset=".35" stopColor={light} /><stop offset="1" stopColor={dark} />
        </linearGradient>
      </defs>
      {body}
    </svg>
  );
});

/** Seed sketch used on oil category hero tiles — ported from the prototype's seedArt(). */
export function SeedArt({ oilColor, seedColor, className }: { oilColor: string; seedColor: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className} width="100%">
      <g fill="none" stroke={seedColor} strokeWidth={2.2} opacity={0.9}>
        <ellipse cx={38} cy={46} rx={16} ry={11} transform="rotate(-24 38 46)" />
        <ellipse cx={74} cy={66} rx={16} ry={11} transform="rotate(14 74 66)" />
        <ellipse cx={52} cy={86} rx={12} ry={8} transform="rotate(-8 52 86)" />
        <path d="M18 24c10 6 16 14 18 24M96 30c-8 8-11 16-11 26" />
      </g>
    </svg>
  );
}
