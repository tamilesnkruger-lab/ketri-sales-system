import type { ReactNode } from "react";
import { revealClassName } from "./animation-classes";

type SectionShellProps = {
  children: ReactNode;
  className?: string;
  eyebrow?: string;
  id: string;
};

export function SectionShell({ children, className = "", eyebrow, id }: SectionShellProps) {
  return (
    <section className={`relative overflow-hidden px-5 py-20 sm:px-8 lg:px-10 lg:py-28 ${className}`} id={id}>
      <div className="pointer-events-none absolute -right-28 top-12 h-64 w-64 rounded-[42%_58%_64%_36%/48%_42%_58%_52%] bg-[#B6FF3B]/20 blur-2xl" />
      <div className={`relative mx-auto w-full max-w-7xl ${revealClassName}`}>
        {eyebrow && (
          <p className="mb-6 inline-flex rounded-full bg-[#B6FF3B] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#20142F] shadow-[0_10px_30px_rgba(182,255,59,0.26)]">
            {eyebrow}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}