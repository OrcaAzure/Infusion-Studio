"use client";

import { useEffect, useState } from "react";
import { Input, type InputProps } from "@/components/ui/input";

interface NumberInputProps extends Omit<InputProps, "value" | "onChange" | "type"> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

/** Number field that allows clearing and re-typing on mobile (no snap-back). */
export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  ...props
}: NumberInputProps) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const commit = (raw: string) => {
    if (raw.trim() === "" || raw === "-") return;
    let n = parseFloat(raw);
    if (Number.isNaN(n)) return;
    if (min != null) n = Math.max(min, n);
    if (max != null) n = Math.min(max, n);
    onChange(n);
    setText(String(n));
  };

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      value={text}
      onChange={(e) => {
        const raw = e.target.value;
        if (/^-?\d*\.?\d*$/.test(raw) || raw === "") {
          setText(raw);
          if (raw !== "" && raw !== "-" && !raw.endsWith(".")) {
            const n = parseFloat(raw);
            if (!Number.isNaN(n)) onChange(n);
          }
        }
      }}
      onBlur={() => commit(text)}
    />
  );
}
