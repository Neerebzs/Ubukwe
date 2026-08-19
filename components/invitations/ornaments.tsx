"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { BILINGUAL, LINEN, OLIVE, ROSE, SAGE } from "./palettes";

export function InvitationQr({
  value,
  color = BILINGUAL.ink,
  size = 112,
  label,
}: {
  value?: string | null;
  color?: string;
  size?: number;
  label?: string;
}) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    if (!value) {
      setSrc("");
      return;
    }
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: { dark: color, light: "#ffffff" },
    }).then(setSrc).catch(() => setSrc(""));
  }, [value, color, size]);

  if (!value || !src) return null;

  return (
    <div className="flex flex-col items-center gap-1">
      <img src={src} alt="" width={size} height={size} />
      {label && <p className="inv-body text-[9px] tracking-wide">{label}</p>}
    </div>
  );
}

export function FloralDivider() {
  return (
    <svg viewBox="0 0 120 24" className="mx-auto my-3 h-6 w-28" aria-hidden>
      <path d="M8 12 C28 6 40 18 60 12 C80 6 92 18 112 12" fill="none" stroke={ROSE.green} strokeWidth="1.1" />
      <ellipse cx="60" cy="12" rx="5" ry="2.2" fill={ROSE.green} opacity="0.85" />
      <circle cx="48" cy="10" r="1.6" fill={ROSE.pink} />
      <circle cx="72" cy="14" r="1.6" fill={ROSE.pink} />
      <ellipse cx="36" cy="11" rx="6" ry="2" fill={ROSE.green} opacity="0.55" transform="rotate(-25 36 11)" />
      <ellipse cx="84" cy="13" rx="6" ry="2" fill={ROSE.green} opacity="0.55" transform="rotate(25 84 13)" />
    </svg>
  );
}

export function RoseCorner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 180" className={className} aria-hidden>
      <ellipse cx="42" cy="48" rx="28" ry="18" fill={ROSE.pink} opacity="0.55" transform="rotate(-20 42 48)" />
      <ellipse cx="58" cy="38" rx="22" ry="14" fill={ROSE.pink} opacity="0.7" transform="rotate(18 58 38)" />
      <ellipse cx="50" cy="58" rx="20" ry="13" fill={ROSE.pink} opacity="0.45" transform="rotate(-8 50 58)" />
      <circle cx="48" cy="46" r="7" fill={ROSE.pink} opacity="0.9" />
      <ellipse cx="88" cy="28" rx="18" ry="7" fill={ROSE.green} opacity="0.55" transform="rotate(28 88 28)" />
      <ellipse cx="24" cy="86" rx="16" ry="6" fill={ROSE.green} opacity="0.5" transform="rotate(55 24 86)" />
      <ellipse cx="70" cy="78" rx="20" ry="7" fill={ROSE.green} opacity="0.45" transform="rotate(-40 70 78)" />
      <ellipse cx="18" cy="40" rx="14" ry="5" fill={ROSE.green} opacity="0.4" transform="rotate(10 18 40)" />
      <circle cx="76" cy="62" r="3" fill={ROSE.pink} opacity="0.7" />
      <circle cx="30" cy="70" r="2.4" fill={ROSE.pink} opacity="0.65" />
    </svg>
  );
}

export function LineArtCorner({ className }: { className?: string }) {
  const c = BILINGUAL.green;
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden>
      <path d="M8 112 C18 70 48 38 92 18" stroke={c} strokeWidth="1.1" />
      <path d="M92 18 C78 28 70 42 74 56 C80 48 90 42 102 40 C90 52 84 68 90 82" stroke={c} strokeWidth="1" />
      <path d="M74 56 C68 64 62 78 66 92" stroke={c} strokeWidth="1" />
      <ellipse cx="96" cy="36" rx="9" ry="5" transform="rotate(-30 96 36)" stroke={c} strokeWidth="1" />
      <ellipse cx="88" cy="28" rx="8" ry="4.5" transform="rotate(20 88 28)" stroke={c} strokeWidth="1" />
      <ellipse cx="78" cy="34" rx="7" ry="4" transform="rotate(-10 78 34)" stroke={c} strokeWidth="1" />
      <path d="M20 100 C28 88 36 86 40 94 C34 92 28 98 24 108" stroke={c} strokeWidth="1" />
    </svg>
  );
}

export function GoldFlourish({ className }: { className?: string }) {
  const c = BILINGUAL.gold;
  return (
    <svg viewBox="0 0 48 120" fill="none" className={className} aria-hidden>
      <path d="M24 0 L24 42" stroke={c} strokeWidth="1.4" />
      <circle cx="24" cy="60" r="7" stroke={c} strokeWidth="1.4" />
      <circle cx="24" cy="60" r="3" fill={c} />
      <path d="M24 50 C10 44 8 32 18 28 C8 38 14 52 24 53" stroke={c} strokeWidth="1.1" />
      <path d="M24 70 C38 76 40 88 30 92 C40 82 34 68 24 67" stroke={c} strokeWidth="1.1" />
      <path d="M24 78 L24 120" stroke={c} strokeWidth="1.4" />
    </svg>
  );
}

export function NameFlourish({ color = BILINGUAL.gold }: { color?: string }) {
  return (
    <svg viewBox="0 0 80 16" className="mx-auto h-4 w-20" aria-hidden>
      <path d="M4 8 C18 2 28 14 40 8 C52 2 62 14 76 8" fill="none" stroke={color} strokeWidth="1.1" />
      <circle cx="40" cy="8" r="1.6" fill={color} />
    </svg>
  );
}

export function GoldHeartRule() {
  const c = BILINGUAL.gold;
  return (
    <div className="flex items-center justify-center gap-2 my-3">
      <div className="h-px w-16" style={{ background: c }} />
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
        <path d="M7 12 C3 8.5 1.5 6.2 1.5 4.2 C1.5 2.6 2.7 1.5 4.2 1.5 C5.3 1.5 6.3 2.1 7 3 C7.7 2.1 8.7 1.5 9.8 1.5 C11.3 1.5 12.5 2.6 12.5 4.2 C12.5 6.2 11 8.5 7 12Z" fill={c} />
      </svg>
      <div className="h-px w-16" style={{ background: c }} />
    </div>
  );
}

export function SageSpray({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 160" className={className} aria-hidden>
      <ellipse cx="40" cy="90" rx="22" ry="8" fill={SAGE.leaf} opacity="0.55" transform="rotate(-40 40 90)" />
      <ellipse cx="70" cy="70" rx="26" ry="9" fill={SAGE.leafDark} opacity="0.45" transform="rotate(-18 70 70)" />
      <ellipse cx="98" cy="48" rx="24" ry="8" fill={SAGE.leaf} opacity="0.5" transform="rotate(12 98 48)" />
      <ellipse cx="30" cy="50" rx="20" ry="7" fill={SAGE.sage} opacity="0.45" transform="rotate(35 30 50)" />
      <ellipse cx="118" cy="78" rx="28" ry="9" fill={SAGE.leaf} opacity="0.4" transform="rotate(-30 118 78)" />
      <ellipse cx="150" cy="40" rx="18" ry="7" fill={SAGE.sage} opacity="0.5" transform="rotate(20 150 40)" />
      <circle cx="52" cy="58" r="7" fill={SAGE.peach} opacity="0.75" />
      <circle cx="86" cy="36" r="6" fill={SAGE.peach} opacity="0.65" />
      <circle cx="128" cy="52" r="5" fill={SAGE.peach} opacity="0.7" />
      <ellipse cx="168" cy="72" rx="16" ry="6" fill={SAGE.leafDark} opacity="0.4" transform="rotate(-50 168 72)" />
    </svg>
  );
}

export function GoldContactMark() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className="inline-block shrink-0">
      <path d="M5 1 L5.6 4 L9 4.2 L6.4 6.1 L7.2 9 L5 7.4 L2.8 9 L3.6 6.1 L1 4.2 L4.4 4 Z" fill={SAGE.gold} />
    </svg>
  );
}

export function LinenFloral({ className }: { className?: string }) {
  const c = LINEN.goldDark;
  return (
    <svg viewBox="0 0 140 140" fill="none" className={className} aria-hidden>
      <path d="M12 128 C28 78 62 42 118 18" stroke={c} strokeWidth="1.05" />
      <path d="M118 18 C98 32 88 48 92 68 C102 54 116 46 130 48 C114 64 106 86 114 104" stroke={c} strokeWidth="1" />
      <ellipse cx="112" cy="36" rx="11" ry="5.5" transform="rotate(-28 112 36)" stroke={c} strokeWidth="1" />
      <ellipse cx="100" cy="28" rx="9" ry="4.5" transform="rotate(18 100 28)" stroke={c} strokeWidth="1" />
      <ellipse cx="90" cy="40" rx="8" ry="4" transform="rotate(-8 90 40)" stroke={c} strokeWidth="1" />
      <path d="M28 112 C40 96 52 94 58 106 C50 102 40 110 34 122" stroke={c} strokeWidth="1" />
    </svg>
  );
}

export function WeddingRings({ className }: { className?: string }) {
  const c = LINEN.gold;
  return (
    <svg viewBox="0 0 48 24" className={className} aria-hidden>
      <circle cx="18" cy="12" r="8" fill="none" stroke={c} strokeWidth="1.6" />
      <circle cx="30" cy="12" r="8" fill="none" stroke={c} strokeWidth="1.6" />
    </svg>
  );
}

export function OliveFern({ className }: { className?: string }) {
  const c = OLIVE.ink;
  return (
    <svg viewBox="0 0 120 90" fill="none" className={className} aria-hidden>
      <path d="M118 8 C90 18 70 38 62 70" stroke={c} strokeWidth="0.9" opacity="0.85" />
      <path d="M96 14 C88 22 86 32 90 40" stroke={c} strokeWidth="0.8" />
      <path d="M86 22 C76 28 72 40 76 50" stroke={c} strokeWidth="0.8" />
      <path d="M76 34 C66 40 62 52 66 62" stroke={c} strokeWidth="0.8" />
      <path d="M108 16 C102 10 92 8 84 14" stroke={c} strokeWidth="0.7" />
      <path d="M100 28 C108 24 114 28 116 36" stroke={c} strokeWidth="0.7" />
      <path d="M70 48 C60 46 52 52 50 62" stroke={c} strokeWidth="0.7" />
    </svg>
  );
}

export function OliveFlower({ className }: { className?: string }) {
  const c = OLIVE.ink;
  return (
    <svg viewBox="0 0 48 64" fill="none" className={className} aria-hidden>
      <path d="M24 62 C22 48 28 40 24 28" stroke={c} strokeWidth="0.9" />
      <ellipse cx="24" cy="20" rx="7" ry="10" stroke={c} strokeWidth="0.9" />
      <ellipse cx="16" cy="24" rx="6" ry="9" transform="rotate(-28 16 24)" stroke={c} strokeWidth="0.9" />
      <ellipse cx="32" cy="24" rx="6" ry="9" transform="rotate(28 32 24)" stroke={c} strokeWidth="0.9" />
      <circle cx="24" cy="24" r="2.2" stroke={c} strokeWidth="0.8" />
      <path d="M24 44 C16 40 12 46 14 52" stroke={c} strokeWidth="0.8" />
    </svg>
  );
}

export function OliveDancerIcon() {
  const c = OLIVE.ink;
  return (
    <svg viewBox="0 0 48 48" className="w-9 h-9 mx-auto" fill="none" aria-hidden>
      <circle cx="24" cy="8" r="4" stroke={c} strokeWidth="1.2" />
      <path d="M24 12 L24 26" stroke={c} strokeWidth="1.2" />
      <path d="M24 16 L8 10" stroke={c} strokeWidth="1.2" />
      <path d="M24 16 L40 12" stroke={c} strokeWidth="1.2" />
      <path d="M24 26 L14 42" stroke={c} strokeWidth="1.2" />
      <path d="M24 26 L36 42" stroke={c} strokeWidth="1.2" />
      <path d="M14 42 L10 40" stroke={c} strokeWidth="1.1" />
      <path d="M36 42 L40 40" stroke={c} strokeWidth="1.1" />
    </svg>
  );
}

export function OliveChurchIcon() {
  const c = OLIVE.ink;
  return (
    <svg viewBox="0 0 48 48" className="w-9 h-9 mx-auto" fill="none" aria-hidden>
      <path d="M24 4 L24 12" stroke={c} strokeWidth="1.2" />
      <path d="M20 8 L28 8" stroke={c} strokeWidth="1.2" />
      <path d="M8 22 L24 10 L40 22" stroke={c} strokeWidth="1.2" />
      <path d="M12 22 L12 42 L36 42 L36 22" stroke={c} strokeWidth="1.2" />
      <path d="M21 42 L21 30 L27 30 L27 42" stroke={c} strokeWidth="1.2" />
      <circle cx="24" cy="20" r="1.4" fill={c} />
    </svg>
  );
}

export function OliveGlassesIcon() {
  const c = OLIVE.ink;
  return (
    <svg viewBox="0 0 48 48" className="w-9 h-9 mx-auto" fill="none" aria-hidden>
      <path d="M10 14 L16 38 C16 42 20 44 24 38" stroke={c} strokeWidth="1.2" />
      <path d="M14 14 L22 14" stroke={c} strokeWidth="1.2" />
      <path d="M38 12 L30 38 C30 42 26 44 24 36" stroke={c} strokeWidth="1.2" />
      <path d="M34 12 L26 12" stroke={c} strokeWidth="1.2" />
      <path d="M18 24 L30 20" stroke={c} strokeWidth="1.1" />
    </svg>
  );
}
