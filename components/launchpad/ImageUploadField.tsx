"use client";

import { useRef, type ChangeEvent } from "react";
import { CloseIcon, ImageIcon } from "@/components/icons";
import { readFileAsDataUrl } from "@/lib/image";

type ImageUploadFieldProps = {
  label: string;
  ratioLabel: string;
  aspectClassName: string;
  image: string | null;
  onFileSelected: (dataUrl: string) => void;
  onRemove: () => void;
};

export default function ImageUploadField({
  label,
  ratioLabel,
  aspectClassName,
  image,
  onFileSelected,
  onRemove,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    onFileSelected(dataUrl);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">{label}</p>
        <span className="border border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider2 text-bronze">
          {ratioLabel} Required
        </span>
      </div>

      <input ref={inputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleChange} />

      {image ? (
        <div className={`relative mt-2 overflow-hidden border border-gold/50 ${aspectClassName}`}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0"
            aria-label="Replace image"
          >
            <img src={image} alt="" className="h-full w-full object-cover" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center border border-line bg-panel/90 text-bronze transition-colors hover:border-gold hover:text-goldLight"
            aria-label="Remove image"
          >
            <CloseIcon className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`mt-2 flex w-full flex-col items-center justify-center gap-2 border border-dashed border-line bg-panel2 text-bronze transition-colors hover:border-gold/50 hover:text-goldLight ${aspectClassName}`}
        >
          <ImageIcon className="h-6 w-6" />
          <span className="px-4 text-center font-mono text-[9px] uppercase tracking-wider2">
            Upload Image (PNG, JPG)
          </span>
        </button>
      )}
    </div>
  );
}
