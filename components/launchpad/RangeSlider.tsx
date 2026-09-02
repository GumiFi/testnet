"use client";

import { useEffect, useRef, useState } from "react";

const THUMB_CLASSES =
  "pointer-events-none absolute inset-0 h-1 w-full cursor-pointer touch-none appearance-none bg-transparent " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 " +
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 " +
  "[&::-webkit-slider-thumb]:border-gold [&::-webkit-slider-thumb]:bg-goldLight " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 " +
  "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 " +
  "[&::-moz-range-thumb]:border-gold [&::-moz-range-thumb]:bg-goldLight";

export default function RangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
}: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (next: [number, number]) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const minPct = ((valueMin - min) / (max - min)) * 100;
  const maxPct = ((valueMax - min) / (max - min)) * 100;

  useEffect(() => {
    if (!dragging) return;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const stopDragging = () => setDragging(false);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
    window.addEventListener("touchend", stopDragging);
    window.addEventListener("touchcancel", stopDragging);
    window.addEventListener("mouseup", stopDragging);

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
      window.removeEventListener("touchend", stopDragging);
      window.removeEventListener("touchcancel", stopDragging);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, [dragging]);

  function handleTrackClick(event: React.MouseEvent<HTMLDivElement>) {
    // Clicks that land directly on a thumb are handled natively by that
    // range input already — only react to clicks on the bare track.
    if ((event.target as HTMLElement).tagName === "INPUT") return;

    const track = trackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const clicked = Math.round(min + ratio * (max - min));

    const distToMin = Math.abs(clicked - valueMin);
    const distToMax = Math.abs(clicked - valueMax);

    if (distToMin <= distToMax) {
      onChange([Math.min(clicked, valueMax), valueMax]);
    } else {
      onChange([valueMin, Math.max(clicked, valueMin)]);
    }
  }

  return (
    <div
      ref={trackRef}
      onClick={handleTrackClick}
      className="relative flex h-3.5 w-full cursor-pointer items-center"
    >
      <div className="relative h-1 w-full rounded-full bg-line">
        <div
          className="absolute h-1 rounded-full bg-gold"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={valueMin}
        onPointerDown={() => setDragging(true)}
        onTouchStart={() => setDragging(true)}
        onChange={(event) => {
          const next = Math.min(Number(event.target.value), valueMax);
          onChange([next, valueMax]);
        }}
        className={THUMB_CLASSES}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={valueMax}
        onPointerDown={() => setDragging(true)}
        onTouchStart={() => setDragging(true)}
        onChange={(event) => {
          const next = Math.max(Number(event.target.value), valueMin);
          onChange([valueMin, next]);
        }}
        className={THUMB_CLASSES}
      />
    </div>
  );
}
