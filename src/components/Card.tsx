import type { ReactNode } from "react";

export function Card({ title, action, children, className = "" }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border/80 bg-card p-5 shadow-[var(--shadow-soft)] ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-border/60 pb-3">
          {title && <h2 className="text-sm font-semibold tracking-tight">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
