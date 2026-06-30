"use client";

/** Inline SVG glyphs for each suit subsystem (stroke 1.5, cyan, themeable). */
export function SystemIcon({
  name,
  className = "h-8 w-8",
}: {
  name: "brain" | "circuit" | "data" | "engine";
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "brain":
      // Deep Learning & AI — a brain glyph.
      return (
        <svg {...common} aria-hidden>
          <path d="M12 5a2.5 2.5 0 0 0-4.8-1A2.5 2.5 0 0 0 4.5 7 2.5 2.5 0 0 0 4 11.8 2.6 2.6 0 0 0 5 16a2.5 2.5 0 0 0 4.8 1.2 2 2 0 0 0 2.2 1V5Z" />
          <path d="M12 5a2.5 2.5 0 0 1 4.8-1A2.5 2.5 0 0 1 19.5 7 2.5 2.5 0 0 1 20 11.8 2.6 2.6 0 0 1 19 16a2.5 2.5 0 0 1-4.8 1.2 2 2 0 0 1-2.2 1" />
          <path d="M8.5 8.5h1M14.5 8.5h1M9 12h2M13 12h2M10 15h4" />
        </svg>
      );
    case "circuit":
      // Machine Learning — a node/circuit network.
      return (
        <svg {...common} aria-hidden>
          <circle cx="6" cy="6" r="2" />
          <circle cx="18" cy="6" r="2" />
          <circle cx="12" cy="12" r="2.4" />
          <circle cx="6" cy="18" r="2" />
          <circle cx="18" cy="18" r="2" />
          <path d="M7.6 7.4 10.3 10.3M16.4 7.4 13.7 10.3M7.6 16.6 10.3 13.7M16.4 16.6 13.7 13.7" />
        </svg>
      );
    case "data":
      // Data Intelligence — stacked database / signal bars.
      return (
        <svg {...common} aria-hidden>
          <ellipse cx="12" cy="5" rx="7" ry="2.6" />
          <path d="M5 5v6c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V5" />
          <path d="M5 11v6c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-6" />
        </svg>
      );
    case "engine":
      // Engineering — terminal / code brackets.
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M7 9l2.5 2.5L7 14M12.5 14H17" />
        </svg>
      );
  }
}
