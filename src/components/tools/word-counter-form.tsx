"use client";

import { useState } from "react";

export function WordCounterForm() {
  const [text, setText] = useState("");

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s+/g, "").length;
  const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0;
  const paragraphs = text.trim() ? text.split(/\n+/).filter(p => p.trim().length > 0).length : 0;
  const readingTime = Math.ceil(words / 200);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="text" className="text-sm font-medium">Text</label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your text here..."
          className="w-full h-48 p-4 rounded-md border border-input bg-background resize-y focus:outline-none focus:ring-2 focus:ring-[#19D7C1]"
          data-testid="text-input"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard value={words} label="Words" id="word-count" />
        <StatCard value={chars} label="Characters" id="char-count" />
        <StatCard value={charsNoSpaces} label="Characters (no spaces)" />
        <StatCard value={sentences} label="Sentences" />
        <StatCard value={paragraphs} label="Paragraphs" />
        <StatCard value={`${readingTime} min`} label="Reading time" id="reading-time" />
      </div>
    </div>
  );
}

function StatCard({ value, label, id }: { value: string | number, label: string, id?: string }) {
  return (
    <div className="bg-muted/50 rounded-2xl p-4 text-center space-y-1">
      <div className="text-3xl font-bold" data-testid={id}>{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</div>
    </div>
  );
}
