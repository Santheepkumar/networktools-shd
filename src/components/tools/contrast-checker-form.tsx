"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

function getLuminance(hex: string) {
  if (hex.startsWith("#")) hex = hex.slice(1);
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  let r = parseInt(hex.slice(0, 2), 16) / 255;
  let g = parseInt(hex.slice(2, 4), 16) / 255;
  let b = parseInt(hex.slice(4, 6), 16) / 255;

  const linearize = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function getContrast(hex1: string, hex2: string) {
  try {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  } catch {
    return 1;
  }
}

export function ContrastCheckerForm() {
  const [textColor, setTextColor] = useState("#06131F");
  const [bgColor, setBgColor] = useState("#19D7C1");
  const [ratio, setRatio] = useState(1);

  useEffect(() => {
    setRatio(getContrast(textColor, bgColor));
  }, [textColor, bgColor]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ColorPicker label="Text Color" value={textColor} onChange={setTextColor} id="text-color" />
        <ColorPicker label="Background Color" value={bgColor} onChange={setBgColor} id="bg-color" />
      </div>

      <div 
        className="h-32 rounded-2xl flex items-center justify-center p-6 text-center border shadow-inner transition-colors"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <span className="text-3xl font-bold">AaBbCc 123</span>
      </div>

      <div className="flex flex-col items-center gap-2 p-6 bg-muted/30 rounded-2xl border">
        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Contrast Ratio</div>
        <div className="text-5xl font-bold" data-testid="contrast-ratio">
          {ratio.toFixed(2)} : 1
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Badge pass={ratio >= 4.5} label="AA Normal" id="wcag-aa-normal" />
        <Badge pass={ratio >= 3} label="AA Large" />
        <Badge pass={ratio >= 7} label="AAA Normal" />
        <Badge pass={ratio >= 4.5} label="AAA Large" />
      </div>
    </div>
  );
}

function ColorPicker({ label, value, onChange, id }: { label: string, value: string, onChange: (v: string) => void, id: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg overflow-hidden relative cursor-pointer border border-border shrink-0">
          <input
            type="color"
            value={value.substring(0, 7)}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -inset-4 w-[200%] h-[200%] cursor-pointer"
            data-testid={id}
          />
        </div>
        <Input 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="font-mono uppercase" 
        />
      </div>
    </div>
  );
}

function Badge({ pass, label, id }: { pass: boolean, label: string, id?: string }) {
  return (
    <div 
      className={`px-3 py-2 rounded-full text-center text-sm font-semibold border ${
        pass ? "bg-[#19D7C1]/20 text-teal-700 border-[#19D7C1]" : "bg-red-500/10 text-red-700 border-red-500/30"
      }`}
      data-testid={id}
    >
      <div className="text-xs opacity-70 mb-0.5">{label}</div>
      {pass ? "PASS" : "FAIL"}
    </div>
  );
}
