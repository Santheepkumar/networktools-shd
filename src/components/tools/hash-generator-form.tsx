"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";

export function HashGeneratorForm() {
  const [text, setText] = useState("");
  const [hashes, setHashes] = useState<{ sha1: string; sha256: string; sha512: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const digestMessage = async (algorithm: string, message: string) => {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest(algorithm, msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  };

  const handleGenerate = async () => {
    if (!text) return;
    const sha1 = await digestMessage("SHA-1", text);
    const sha256 = await digestMessage("SHA-256", text);
    const sha512 = await digestMessage("SHA-512", text);
    setHashes({ sha1, sha256, sha512 });
  };

  const handleCopy = async (hash: string, type: string) => {
    await navigator.clipboard.writeText(hash);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="text" className="text-sm font-medium">Text to hash</label>
        <Input
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter any text..."
          data-testid="hash-input"
        />
      </div>
      <Button 
        onClick={handleGenerate} 
        data-testid="generate-btn"
        className="bg-[#19D7C1] text-[#06131F] hover:bg-[#19D7C1]/90"
      >
        Generate Hashes
      </Button>

      {hashes && (
        <div className="space-y-4 mt-6">
          <HashRow label="SHA-1" value={hashes.sha1} id="sha1-value" copied={copied} onCopy={handleCopy} />
          <HashRow label="SHA-256" value={hashes.sha256} id="sha256-value" copied={copied} onCopy={handleCopy} />
          <HashRow label="SHA-512" value={hashes.sha512} id="sha512-value" copied={copied} onCopy={handleCopy} />
        </div>
      )}
    </div>
  );
}

function HashRow({ label, value, id, copied, onCopy }: { label: string, value: string, id: string, copied: string | null, onCopy: (val: string, type: string) => void }) {
  const isCopied = copied === label;
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <Input readOnly value={value} data-testid={id} className="font-mono text-sm" />
        <Button variant="outline" size="icon" onClick={() => onCopy(value, label)}>
          {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
