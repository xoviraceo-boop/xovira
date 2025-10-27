"use client";
import { useEffect, useState } from "react";

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search...",
}: {
  value?: string;
  onChange?: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
}) {
  const [local, setLocal] = useState(value || "");

  useEffect(() => {
    setLocal(value || "");
  }, [value]);

  return (
    <div className="flex w-full max-w-xl items-center gap-2">
      <input
        type="text"
        value={local}
        onChange={(e) => {
          setLocal(e.target.value);
          onChange?.(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSubmit?.();
          }
        }}
        placeholder={placeholder}
        className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <button
        type="button"
        onClick={onSubmit}
        className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Search
      </button>
    </div>
  );
}
