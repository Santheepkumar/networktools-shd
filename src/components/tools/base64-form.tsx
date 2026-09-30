'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCw } from 'lucide-react';

export function Base64Form() {
  const [mode, setMode] = React.useState<'encode' | 'decode'>('encode');
  const [input, setInput] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');

  const handleRun = () => {
    setError('');
    setOutput('');
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
    } catch (e) {
      setError('Invalid input for decoding.');
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
          placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          data-testid="base64-input"
        />
      </div>

      <Button onClick={handleRun} className="bg-[#19D7C1] hover:bg-[#19D7C1]/90 text-black">
        <RefreshCw className="mr-2 h-4 w-4" />
        {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
      </Button>

      {error && <div className="text-sm text-destructive mt-2">{error}</div>}

      <div className="space-y-2">
        <label className="text-sm font-medium">Output</label>
        <div className="relative">
          <textarea
            className="flex min-h-[120px] w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm font-mono shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pr-10"
            value={output}
            readOnly
            data-testid="base64-output"
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
