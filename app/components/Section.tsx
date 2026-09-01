import { ReactNode } from "react";

export default function Section({
  id,
  eyebrow,
  children,
}: {
  id: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="flex scroll-mt-24 flex-col gap-6 border-t border-neutral-900 pt-10 first:border-t-0 first:pt-0"
    >
      <span className="text-xs font-semibold uppercase tracking-widest text-accent-light">
        {eyebrow}
      </span>
      {children}
    </section>
  );
}
