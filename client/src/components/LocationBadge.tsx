/** Compact HK building location chip — floor / zone first-class. */
export function LocationBadge({
  location,
  emphasize,
  interactive,
}: {
  location: string;
  emphasize?: boolean;
  /** Soften when parent chip provides hover */
  interactive?: boolean;
}) {
  return (
    <span
      className={`inline-flex max-w-full items-center truncate rounded-md px-1.5 py-0.5 font-mono text-[11px] font-medium tracking-tight ring-1 transition-colors duration-150 ${
        emphasize
          ? 'bg-signal-high/10 text-signal-high ring-signal-high/30'
          : interactive
            ? 'bg-white/[0.05] text-mist-200 ring-white/[0.1] group-hover:bg-accent/10 group-hover:text-accent group-hover:ring-accent/30 group-hover/card:bg-accent/10 group-hover/card:text-accent group-hover/card:ring-accent/30'
            : 'bg-white/[0.05] text-mist-200 ring-white/[0.1]'
      }`}
      title={location}
    >
      {location}
    </span>
  );
}
