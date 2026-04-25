import React from "react";
import { cn } from "@/lib/utils";

type FeatureType = {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  pattern?: number[][];
};

type FeatureCardProps = React.ComponentProps<"div"> & {
  feature: FeatureType;
};

// Pre-defined patterns so the cards stay deterministic across SSR/hydration.
const FALLBACK_PATTERNS: number[][][] = [
  [[7, 1], [10, 3], [8, 5], [9, 2], [7, 6]],
  [[8, 2], [9, 4], [7, 1], [10, 5], [8, 6]],
  [[9, 1], [7, 4], [10, 2], [8, 3], [9, 6]],
  [[10, 1], [8, 4], [7, 2], [9, 5], [10, 3]],
  [[7, 3], [9, 6], [8, 1], [10, 4], [7, 5]],
  [[8, 1], [10, 2], [9, 3], [7, 5], [8, 4]],
];

function patternForTitle(title: string): number[][] {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash * 31 + title.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % FALLBACK_PATTERNS.length;
  return FALLBACK_PATTERNS[idx];
}

export function FeatureCard({ feature, className, ...props }: FeatureCardProps) {
  const pattern = feature.pattern ?? patternForTitle(feature.title);

  return (
    <div className={cn("relative overflow-hidden p-6", className)} {...props}>
      <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
        <div className="from-foreground/5 to-foreground/1 absolute inset-0 bg-linear-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] opacity-100">
          <GridPattern
            width={20}
            height={20}
            x="-12"
            y="4"
            squares={pattern}
            className="fill-foreground/5 stroke-foreground/25 absolute inset-0 h-full w-full mix-blend-overlay"
          />
        </div>
      </div>
      <feature.icon
        className="text-foreground/75 size-6"
        strokeWidth={1.5}
        aria-hidden
      />
      <h3 className="mt-10 text-sm md:text-base">{feature.title}</h3>
      <p className="text-muted-foreground relative z-20 mt-2 text-xs font-light leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
}

function GridPattern({
  width,
  height,
  x,
  y,
  squares,
  ...props
}: React.ComponentProps<"svg"> & {
  width: number;
  height: number;
  x: string;
  y: string;
  squares?: number[][];
}) {
  const patternId = React.useId();

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([sx, sy], index) => (
            <rect
              strokeWidth="0"
              key={index}
              width={width + 1}
              height={height + 1}
              x={sx * width}
              y={sy * height}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}
