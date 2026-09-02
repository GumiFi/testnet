"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { CloseIcon } from "@/components/icons";

type Size = {
  width: number;
  height: number;
};

type Point = {
  x: number;
  y: number;
};

type ImageCropModalProps = {
  src: string;
  aspect: number;
  title: string;
  onCancel: () => void;
  onConfirm: (result: string) => void;
};

export default function ImageCropModal({ src, aspect, title, onCancel, onConfirm }: ImageCropModalProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const dragState = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);

  const [naturalSize, setNaturalSize] = useState<Size | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const viewportWidth = 260;
  const viewportHeight = viewportWidth / aspect;

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onCancel]);

  function baseScaleFor(size: Size) {
    return Math.max(viewportWidth / size.width, viewportHeight / size.height);
  }

  function clampOffset(nextOffset: Point, nextZoom: number, size: Size) {
    const scale = baseScaleFor(size) * nextZoom;
    const displayWidth = size.width * scale;
    const displayHeight = size.height * scale;
    const minX = viewportWidth - displayWidth;
    const minY = viewportHeight - displayHeight;
    return {
      x: Math.min(0, Math.max(minX, nextOffset.x)),
      y: Math.min(0, Math.max(minY, nextOffset.y)),
    };
  }

  function handleImageLoad() {
    const image = imageRef.current;
    if (!image) return;
    const size = { width: image.naturalWidth, height: image.naturalHeight };
    const scale = baseScaleFor(size);
    const displayWidth = size.width * scale;
    const displayHeight = size.height * scale;
    setNaturalSize(size);
    setZoom(1);
    setOffset({ x: (viewportWidth - displayWidth) / 2, y: (viewportHeight - displayHeight) / 2 });
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!naturalSize) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
    setDragging(true);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragState.current || !naturalSize) return;
    const deltaX = event.clientX - dragState.current.startX;
    const deltaY = event.clientY - dragState.current.startY;
    const nextOffset = {
      x: dragState.current.originX + deltaX,
      y: dragState.current.originY + deltaY,
    };
    setOffset(clampOffset(nextOffset, zoom, naturalSize));
  }

  function handlePointerUp() {
    dragState.current = null;
    setDragging(false);
  }

  function handleZoomChange(value: number) {
    if (!naturalSize) return;
    const scale = baseScaleFor(naturalSize);
    const prevDisplayWidth = naturalSize.width * scale * zoom;
    const prevDisplayHeight = naturalSize.height * scale * zoom;
    const centerX = viewportWidth / 2 - offset.x;
    const centerY = viewportHeight / 2 - offset.y;
    const ratioX = centerX / prevDisplayWidth;
    const ratioY = centerY / prevDisplayHeight;
    const nextDisplayWidth = naturalSize.width * scale * value;
    const nextDisplayHeight = naturalSize.height * scale * value;
    const nextOffset = {
      x: viewportWidth / 2 - ratioX * nextDisplayWidth,
      y: viewportHeight / 2 - ratioY * nextDisplayHeight,
    };
    setZoom(value);
    setOffset(clampOffset(nextOffset, value, naturalSize));
  }

  function handleConfirm() {
    const image = imageRef.current;
    if (!image || !naturalSize) return;
    const scale = baseScaleFor(naturalSize) * zoom;
    const sourceX = -offset.x / scale;
    const sourceY = -offset.y / scale;
    const sourceWidth = viewportWidth / scale;
    const sourceHeight = viewportHeight / scale;
    const outputHeight = 480;
    const outputWidth = Math.round(outputHeight * aspect);
    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, outputWidth, outputHeight);
    onConfirm(canvas.toDataURL("image/png"));
  }

  const displayScale = naturalSize ? baseScaleFor(naturalSize) * zoom : 0;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-6">
      <div className="absolute inset-0 animate-fadeIn bg-void/80 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative w-full max-w-sm border border-gold/40 bg-panel px-5 py-6 animate-fadeUp">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm uppercase tracking-wider2 text-ivory">{title}</h2>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-7 w-7 items-center justify-center border border-line text-bronze transition-colors hover:border-gold hover:text-goldLight"
            aria-label="Close"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-5 flex justify-center">
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{ width: viewportWidth, height: viewportHeight, touchAction: "none" }}
            className={`relative overflow-hidden border border-gold/50 bg-panel2 ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
          >
            <img
              ref={imageRef}
              src={src}
              onLoad={handleImageLoad}
              alt=""
              draggable={false}
              style={
                naturalSize
                  ? {
                      position: "absolute",
                      left: offset.x,
                      top: offset.y,
                      width: naturalSize.width * displayScale,
                      height: naturalSize.height * displayScale,
                      maxWidth: "none",
                    }
                  : { position: "absolute", opacity: 0 }
              }
            />
            <div className="pointer-events-none absolute inset-0 border border-goldLight/30" />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(event) => handleZoomChange(parseFloat(event.target.value))}
            disabled={!naturalSize}
            className="w-full accent-gold"
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="border border-line px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider2 text-bronze transition-colors hover:border-gold/40 hover:text-ivory"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!naturalSize}
            className={`border px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider2 transition-colors ${
              naturalSize
                ? "border-gold text-goldLight hover:bg-gold hover:text-void"
                : "cursor-not-allowed border-line text-bronze"
            }`}
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}
