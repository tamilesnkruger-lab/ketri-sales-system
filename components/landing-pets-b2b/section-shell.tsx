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
    <section className={`px-5 py-24 sm:px-8 lg:px-10 lg:py-36 ${className}`} id={id}>
      <div className={`mx-auto w-full max-w-7xl ${revealClassName}`}>
        {eyebrow && <p className="mb-7 text-xs font-bold uppercase tracking-[0.22em] text-leaf">{eyebrow}</p>}
        {children}
      </div>
    </section>
  );
}