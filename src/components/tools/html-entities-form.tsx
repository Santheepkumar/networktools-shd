'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCw } from 'lucide-react';

export function HtmlEntitiesForm() {
  const [mode, setMode] = React.useState<'encode' | 'decode'>('encode');
  const [input, setInput] = React.useState('');
  const [output, setOutput] = React.useState('');

  const encodeHtml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const decodeHtml = (str: string) => {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(Number(dec)));
  };

  const handleRun = () => {
    if (mode === 'encode') {
      setOutput(encodeHtml(input));
    } else {
      setOutput(decodeHtml(input));
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          variant={mode === 'encode' ? 'default' : 'outline'}
          onClick={() => setMode('encode')}
          className={mode === 'encode' ? 'bg-[#19D7C1] hover:bg-[#19D7C1]/90 text-black' : ''}
          data-testid="mode-encode"
        >
          Encode
        </Button>
        <Button
          variant={mode === 'decode' ? 'default' : 'outline'}
          onClick={() => setMode('decode')}
          className={mode === 'decode' ? 'bg-[#19D7C1] hover:bg-[#19D7C1]/90 text-black' : ''}
          data-testid="mode-decode"
        >
          Decode
        </Button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Input</label>
        <textarea
          className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          data-testid="html-input"
        />
      </div>

      <Button onClick={handleRun} className="bg-[#19D7C1] hover:bg-[#19D7C1]/90 text-black">
        <RefreshCw className="mr-2 h-4 w-4" />
        {mode === 'encode' ? 'Encode Entities' : 'Decode Entities'}
      </Button>

      <div className="space-y-2">
        <label className="text-sm font-medium">Output</label>
        <div className="relative">
          <textarea
            className="flex min-h-[120px] w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm font-mono shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pr-10"
            value={output}
            readOnly
            data-testid="html-output"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleCopy}
            data-testid="copy-btn"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
