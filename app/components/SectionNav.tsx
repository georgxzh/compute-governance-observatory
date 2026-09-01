const LINKS = [
  { id: "estimator", label: "Estimator" },
  { id: "hardware", label: "Hardware" },
  { id: "validation", label: "Validation" },
  { id: "landscape", label: "Compute landscape" },
  { id: "thresholds", label: "Thresholds" },
];

export default function SectionNav() {
  return (
    <nav className="sticky top-0 z-20 -mx-6 flex gap-1 overflow-x-auto border-b border-neutral-900 bg-[#08080c]/90 px-6 py-3 backdrop-blur-sm sm:mx-0 sm:rounded-lg sm:border sm:px-2">
      {LINKS.map((link) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-neutral-100"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
