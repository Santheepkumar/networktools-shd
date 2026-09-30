"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

export function RegexTesterForm() {
  const [pattern, setPattern] = useState("(\\w+)");
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false });
  const [testString, setTestString] = useState("Hello world! 123");
  
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<RegExpMatchArray[]>([]);
  const [highlightedText, setHighlightedText] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    if (!pattern) {
      setError(null);
      setMatches([]);
      setHighlightedText([testString]);
      return;
    }

    try {
      const flagStr = Object.entries(flags).filter(([_, v]) => v).map(([k]) => k).join("");
      const regex = new RegExp(pattern, flagStr);
      setError(null);

      if (flags.g) {
        const allMatches = [...testString.matchAll(regex)];
        setMatches(allMatches);

        let lastIndex = 0;
        const nodes: React.ReactNode[] = [];
        allMatches.forEach((m, i) => {
          if (m.index !== undefined) {
            nodes.push(<span key={`text-${i}`}>{testString.slice(lastIndex, m.index)}</span>);
            nodes.push(
              <span key={`match-${i}`} className="bg-[#19D7C1]/20 rounded px-1">
                {m[0]}
              </span>
            );
            lastIndex = m.index + m[0].length;
          }
        });
        nodes.push(<span key="end">{testString.slice(lastIndex)}</span>);
        setHighlightedText(nodes);
      } else {
        const match = testString.match(regex);
        if (match && match.index !== undefined) {
          setMatches([match as RegExpMatchArray]);
          const nodes = [
            <span key="start">{testString.slice(0, match.index)}</span>,
            <span key="match" className="bg-[#19D7C1]/20 rounded px-1">{match[0]}</span>,
            <span key="end">{testString.slice(match.index + match[0].length)}</span>
          ];
          setHighlightedText(nodes);
        } else {
          setMatches([]);
          setHighlightedText([testString]);
        }
      }
    } catch (e) {
      setError((e as Error).message);
      setMatches([]);
      setHighlightedText([testString]);
    }
  }, [pattern, flags, testString]);

  const toggleFlag = (flag: keyof typeof flags) => {
    setFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="pattern" className="text-sm font-medium">Pattern</label>
        <Input
          id="pattern"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="(\w+)"
          className="font-mono"
          data-testid="regex-pattern"
        />
        {error && <p className="text-sm text-red-500 mt-1" data-testid="regex-error">{error}</p>}
      </div>
      
      <div className="flex gap-4">
        {(["g", "i", "m", "s"] as const).map(f => (
          <label key={f} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={flags[f]}
              onChange={() => toggleFlag(f)}
              className="rounded border-input text-[#19D7C1] focus:ring-[#19D7C1]"
            />
            /{f}
          </label>
        ))}
      </div>

      <div className="space-y-2">
        <label htmlFor="testString" className="text-sm font-medium">Test String</label>
        <textarea
          id="testString"
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          className="w-full h-32 p-3 rounded-md border border-input bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#19D7C1]"
          data-testid="test-string"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Results</h3>
          <span className="px-2 py-1 bg-muted rounded-full text-xs font-semibold" data-testid="match-count">
            {matches.length} matches
          </span>
        </div>

        <div className="p-4 rounded-md border bg-muted/50 whitespace-pre-wrap break-all font-mono text-sm leading-relaxed">
          {highlightedText.length > 0 ? highlightedText : <span className="text-muted-foreground italic">No matches</span>}
        </div>

        {flags.g && matches.length > 0 && (
          <div className="space-y-2">
            {matches.map((m, i) => (
              <div key={i} className="p-3 rounded-md border bg-background text-sm font-mono space-y-1">
                <div className="text-muted-foreground">Match {i + 1} (Index: {m.index})</div>
                <div>{m[0]}</div>
                {m.length > 1 && (
                  <div className="pl-4 border-l-2 border-[#19D7C1] mt-2 space-y-1">
                    {Array.from(m).slice(1).map((group, gi) => (
                      <div key={gi} className="text-xs text-muted-foreground">
                        Group {gi + 1}: <span className="text-foreground">{group}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
