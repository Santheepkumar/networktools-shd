"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";

const WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do",
  "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim",
  "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "ut",
  "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "dolor", "in",
  "reprehenderit", "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla",
  "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "in", "culpa",
  "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum", "curabitur", "pretium",
  "tincidunt", "lacus", "nulla", "gravida", "orci", "a", "odio", "nullam", "varius", "turpis",
  "et", "commodo", "pharetra", "est", "eros", "bibendum", "elit", "nec", "luctus", "magna",
  "felis", "sollicitudin", "mauris", "integer", "in", "mauris", "eu", "nibh", "euismod", "gravida",
  "duis", "ac", "tellus", "et", "risus", "vulputate", "vehicula", "donec", "lobortis", "risus",
  "a", "elit", "etiam", "ligula", "pellentesque", "aliquet", "nibh", "nec", "urna", "in",
  "nisi", "neque", "aliquet", "vel", "dapibus", "id", "mattis", "vel", "nisi", "sed",
  "pretium", "ligula", "rutrum", "tempor", "aliquam", "viverra", "orci", "non", "quam", "id",
  "porta", "odio", "rutrum", "cras", "a", "mi", "cras", "purus", "odio", "vestibulum",
  "in", "dictum", "non", "ullamcorper", "ac", "ipsum", "suspendisse", "potenti", "nulla", "facilisi",
  "aenean", "nec", "eros", "vestibulum", "ante", "ipsum", "primis", "in", "faucibus", "orci",
  "luctus", "et", "ultrices", "posuere", "cubilia", "curae", "suspendisse", "sollicitudin", "velit", "sed"
];

function getRandomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function generateSentence() {
  const length = Math.floor(Math.random() * 8) + 8; // 8-15 words
  const words = Array.from({ length }, () => getRandomWord());
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ") + ".";
}

function generateParagraph() {
  const length = Math.floor(Math.random() * 4) + 4; // 4-7 sentences
  return Array.from({ length }, () => generateSentence()).join(" ");
}

export function LoremIpsumForm() {
  const [count, setCount] = useState<number>(3);
  const [unit, setUnit] = useState<"Paragraphs" | "Sentences" | "Words">("Paragraphs");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const c = Math.max(1, Math.min(50, count));
    let res = "";
    if (unit === "Paragraphs") {
      res = Array.from({ length: c }, () => generateParagraph()).join("\n\n");
    } else if (unit === "Sentences") {
      res = Array.from({ length: c }, () => generateSentence()).join(" ");
    } else if (unit === "Words") {
      res = Array.from({ length: c }, () => getRandomWord()).join(" ");
      res = res.charAt(0).toUpperCase() + res.slice(1) + (res.length > 0 ? "." : "");
    }
    setOutput(res);
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="count" className="text-sm font-medium">Count</label>
          <Input
            id="count"
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            data-testid="count-input"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="unit" className="text-sm font-medium">Unit</label>
          <select
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value as any)}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="unit-select"
          >
            <option value="Paragraphs">Paragraphs</option>
            <option value="Sentences">Sentences</option>
            <option value="Words">Words</option>
          </select>
        </div>
      </div>
      <Button 
        onClick={handleGenerate} 
        data-testid="generate-btn"
        className="bg-[#19D7C1] text-[#06131F] hover:bg-[#19D7C1]/90"
      >
        Generate
      </Button>

      {output && (
        <div className="space-y-2 relative">
          <textarea
            readOnly
            value={output}
            className="w-full h-64 p-4 rounded-md border border-input bg-background font-normal text-sm resize-none focus:outline-none"
            data-testid="lorem-output"
          />
          <Button
            size="icon"
            variant="secondary"
            onClick={handleCopy}
            data-testid="copy-btn"
            className="absolute top-2 right-2"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}
