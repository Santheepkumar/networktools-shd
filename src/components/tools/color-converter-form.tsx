"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToHsv(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}

function rgbToCmyk(r: number, g: number, b: number) {
  let c = 1 - (r / 255);
  let m = 1 - (g / 255);
  let y = 1 - (b / 255);
  let k = Math.min(c, Math.min(m, y));
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  c = Math.round(((c - k) / (1 - k)) * 100);
  m = Math.round(((m - k) / (1 - k)) * 100);
  y = Math.round(((y - k) / (1 - k)) * 100);
  k = Math.round(k * 100);
  return { c, m, y, k };
}

export function ColorConverterForm() {
  const [hex, setHex] = useState("#19D7C1");
  const [rgbStr, setRgbStr] = useState("");
  const [hslStr, setHslStr] = useState("");
  const [hsvStr, setHsvStr] = useState("");
  const [cmykStr, setCmykStr] = useState("");

  useEffect(() => {
    try {
      let cleanHex = hex;
      if (!cleanHex.startsWith("#")) cleanHex = "#" + cleanHex;
      if (cleanHex.length === 4) {
        cleanHex = "#" + cleanHex[1]+cleanHex[1]+cleanHex[2]+cleanHex[2]+cleanHex[3]+cleanHex[3];
      }
      if (/^#[0-9A-Fa-f]{6}$/.test(cleanHex)) {
        const { r, g, b } = hexToRgb(cleanHex);
        setRgbStr(`rgb(${r}, ${g}, ${b})`);
        
        const hsl = rgbToHsl(r, g, b);
        setHslStr(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`);
        
        const hsv = rgbToHsv(r, g, b);
        setHsvStr(`hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`);
        
        const cmyk = rgbToCmyk(r, g, b);
        setCmykStr(`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`);
      }
    } catch (e) {
      // ignore invalid hex during typing
    }
  }, [hex]);

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Color</label>
          <div className="h-20 w-20 rounded-2xl overflow-hidden relative cursor-pointer border border-border shrink-0">
            <input
              type="color"
              value={hex.substring(0, 7)}
              onChange={(e) => setHex(e.target.value.toUpperCase())}
              className="absolute -inset-4 w-[200%] h-[200%] cursor-pointer"
              data-testid="color-picker"
            />
          </div>
        </div>
        <div className="space-y-2 flex-1">
          <label htmlFor="hex" className="text-sm font-medium">HEX</label>
          <Input
            id="hex"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="font-mono h-12 text-lg uppercase"
            data-testid="hex-input"
          />
        </div>
      </div>

      <div
        className="h-20 rounded-2xl w-full border border-border transition-colors shadow-inner"
        style={{ backgroundColor: hex }}
      />

      <div className="space-y-4 pt-4 border-t">
        <OutputRow label="RGB" value={rgbStr} id="rgb-output" />
        <OutputRow label="HSL" value={hslStr} id="hsl-output" />
        <OutputRow label="HSV" value={hsvStr} />
        <OutputRow label="CMYK" value={cmykStr} />
      </div>
    </div>
  );
}

function OutputRow({ label, value, id }: { label: string, value: string, id?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="w-16 text-sm font-medium text-muted-foreground">{label}</div>
      <div className="flex-1 flex gap-2">
        <Input readOnly value={value} className="font-mono bg-muted/30" data-testid={id} />
        <Button variant="outline" size="icon" onClick={handleCopy} shrink-0="true">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
