"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ImageComparisonProps = {
  beforeImage: string;
  afterImage: string;
  altBefore?: string;
  altAfter?: string;
  initialPosition?: number;
  className?: string;
};

// Sweep waypoints for the auto-hint animation. Tuned for ~2.4s total.
const HINT_WAYPOINTS = [
  { value: 78, duration: 700 },
  { value: 22, duration: 1000 },
  { value: 50, duration: 700 },
];

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function ImageComparison({
  beforeImage,
  afterImage,
  altBefore = "Before",
  altAfter = "After",
  initialPosition = 50,
  className = "",
}: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasAnimatedRef = useRef(false);
  const userInteractedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let newPosition = ((clientX - rect.left) / rect.width) * 100;
      newPosition = Math.max(0, Math.min(100, newPosition));
      setSliderPosition(newPosition);
    },
    [isDragging],
  );

  function markUserInteracted() {
    userInteractedRef.current = true;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  useEffect(() => {
    const stopDragging = () => setIsDragging(false);
    window.addEventListener("mouseup", stopDragging);
    window.addEventListener("touchend", stopDragging);
    return () => {
      window.removeEventListener("mouseup", stopDragging);
      window.removeEventListener("touchend", stopDragging);
    };
  }, []);

  // Hint animation: when the slider scrolls into view, sweep it side-to-side
  // once to telegraph that it's draggable. Stops if the user interacts.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    if (hasAnimatedRef.current) return;
    if (typeof window === "undefined") return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    function runHintAnimation() {
      let waypointIdx = 0;
      let segmentStart = initialPosition;
      let segmentStartTime: number | null = null;

      function step(now: number) {
        if (userInteractedRef.current) return;
        if (waypointIdx >= HINT_WAYPOINTS.length) return;
        const wp = HINT_WAYPOINTS[waypointIdx];
        if (segmentStartTime === null) segmentStartTime = now;

        const elapsed = now - segmentStartTime;
        const t = Math.min(elapsed / wp.duration, 1);
        const eased = easeInOutCubic(t);
        const current = segmentStart + (wp.value - segmentStart) * eased;
        setSliderPosition(current);

        if (t >= 1) {
          segmentStart = wp.value;
          waypointIdx++;
          segmentStartTime = null;
          if (waypointIdx >= HINT_WAYPOINTS.length) return;
        }
        rafRef.current = requestAnimationFrame(step);
      }

      rafRef.current = requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          // Slight delay so the section's reveal animation lands first.
          window.setTimeout(runHintAnimation, 350);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [initialPosition]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full select-none overflow-hidden rounded-2xl border border-border shadow-2xl ${className}`}
      onMouseMove={(e) => handleMove(e.clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      {/* Before image (bottom layer) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={beforeImage}
        alt={altBefore}
        className="absolute inset-0 h-full w-full object-cover object-left"
        draggable={false}
      />

      {/* After image (top layer, clipped by slider) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={afterImage}
          alt={altAfter}
          className="h-full w-full object-cover object-left"
          draggable={false}
        />
      </div>

      {/* Slider handle */}
      <div
        className="absolute inset-y-0 z-10 w-0.5 bg-white/90 shadow-[0_0_12px_rgba(0,0,0,0.4)]"
        style={{ left: `calc(${sliderPosition}% - 1px)` }}
      >
        <button
          type="button"
          aria-label="Drag to compare"
          onMouseDown={() => {
            markUserInteracted();
            setIsDragging(true);
          }}
          onTouchStart={() => {
            markUserInteracted();
            setIsDragging(true);
          }}
          className={`absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-white text-neutral-700 shadow-lg ring-1 ring-black/10 transition-transform duration-200 ${
            isDragging ? "scale-110" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
            <polyline points="9 18 15 12 9 6" transform="translate(6 0)" />
          </svg>
        </button>
      </div>

      {/* Before / After labels */}
      <div className="pointer-events-none absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white backdrop-blur">
        Before
      </div>
      <div className="pointer-events-none absolute top-4 right-4 rounded-full bg-primary/90 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white backdrop-blur">
        After
      </div>
    </div>
  );
}
