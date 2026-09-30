"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { diffLines } from "diff";

export function TextDiffForm() {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [diff, setDiff] = useState<any[] | null>(null);

  const handleCompare = () => {
    const changes = diffLines(original, modified);
    setDiff(changes);
  };

  const addedCount = diff?.filter(c => c.added).reduce((acc, c) => acc + (c.count || 0), 0) || 0;
  const removedCount = diff?.filter(c => c.removed).reduce((acc, c) => acc + (c.count || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="original" className="text-sm font-medium">Original</label>
          <textarea
            id="original"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            className="w-full h-64 p-3 rounded-md border border-input bg-background font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#19D7C1]"
            data-testid="text-original"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="modified" className="text-sm font-medium">Modified</label>
          <textarea
            id="modified"
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            className="w-full h-64 p-3 rounded-md border border-input bg-background font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#19D7C1]"
            data-testid="text-modified"
          />
        </div>
      </div>
      
      <Button 
        onClick={handleCompare} 
        data-testid="compare-btn"
        className="bg-[#19D7C1] text-[#06131F] hover:bg-[#19D7C1]/90"
      >
        Compare
      </Button>

      {diff && (
        <div className="space-y-4">
          <div className="flex gap-4 text-sm font-medium text-muted-foreground">
            <span className="text-green-500">{addedCount} lines added</span>
            <span className="text-red-500">{removedCount} lines removed</span>
          </div>
          <div 
            className="border rounded-md bg-background overflow-x-auto p-4 font-mono text-sm whitespace-pre-wrap"
            data-testid="diff-result"
          >
            {diff.map((part, index) => {
              const lines = part.value.replace(/\n$/, "").split("\n");
              return lines.map((line: string, i: number) => {
                let className = "px-3 py-0.5 ";
                let prefix = " ";
                if (part.added) {
                  className += "bg-green-500/10 text-green-400 border-l-2 border-green-500";
                  prefix = "+";
                } else if (part.removed) {
                  className += "bg-red-500/10 text-red-400 border-l-2 border-red-500";
                  prefix = "-";
                } else {
                  className += "text-muted-foreground";
                }
                return (
                  <div key={`${index}-${i}`} className={className}>
                    <span className="inline-block w-4 opacity-50 select-none">{prefix}</span>
                    {line}
                  </div>
                );
              });
            })}
          </div>
        </div>
      )}
    </div>
  );
}
