'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, RefreshCw, ShieldCheck } from 'lucide-react';

type SecretType = 'Password' | 'API Key' | 'UUID v4' | 'Hex Token' | 'JWT Secret' | 'Base64 Secret';

export function SecretGeneratorForm() {
  const [type, setType] = React.useState<SecretType>('Password');
  const [length, setLength] = React.useState(32);
  const [output, setOutput] = React.useState('');
  
  // Password options
  const [useUpper, setUseUpper] = React.useState(true);
  const [useLower, setUseLower] = React.useState(true);
  const [useNumbers, setUseNumbers] = React.useState(true);
  const [useSymbols, setUseSymbols] = React.useState(true);

  const generateSecret = React.useCallback(() => {
    let result = '';
    const safeLength = Math.max(8, Math.min(512, length));

    const getRandomBytes = (len: number) => {
      const array = new Uint8Array(len);
      crypto.getRandomValues(array);
      return array;
    };

    if (type === 'UUID v4') {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        result = crypto.randomUUID();
      } else {
        result = '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c: any) =>
          (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
        );
      }
    } else if (type === 'API Key') {
      const chars = '0123456789ABCDEF';
      const bytes = getRandomBytes(32);
      for (let i = 0; i < 32; i++) {
        result += chars[bytes[i] % chars.length];
      }
    } else if (type === 'Hex Token') {
      const bytes = getRandomBytes(Math.ceil(safeLength / 2));
      const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      result = hex.slice(0, safeLength);
    } else if (type === 'JWT Secret') {
      const bytes = getRandomBytes(safeLength);
      const b64 = btoa(String.fromCharCode.apply(null, Array.from(bytes)));
      result = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '').slice(0, safeLength);
    } else if (type === 'Base64 Secret') {
      const bytes = getRandomBytes(safeLength);
      result = btoa(String.fromCharCode.apply(null, Array.from(bytes))).slice(0, safeLength);
    } else if (type === 'Password') {
      let charset = '';
      if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
      if (useNumbers) charset += '0123456789';
      if (useSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';
      
      if (!charset) charset = 'abcdefghijklmnopqrstuvwxyz';
      
      const bytes = getRandomBytes(safeLength);
      for (let i = 0; i < safeLength; i++) {
        result += charset[bytes[i] % charset.length];
      }
    }

    setOutput(result);
  }, [type, length, useUpper, useLower, useNumbers, useSymbols]);

  React.useEffect(() => {
    generateSecret();
  }, [generateSecret]);

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
    }
  };

  const types: SecretType[] = ['Password', 'API Key', 'UUID v4', 'Hex Token', 'JWT Secret', 'Base64 Secret'];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <Button
            key={t}
            variant={type === t ? 'default' : 'outline'}
            onClick={() => setType(t)}
            className={type === t ? 'bg-[#19D7C1] hover:bg-[#19D7C1]/90 text-black' : ''}
          >
            {t}
          </Button>
        ))}
      </div>

      {type !== 'UUID v4' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Length</label>
          <Input
            type="number"
            min={8}
            max={512}
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value) || 32)}
            data-testid="length-input"
          />
        </div>
      )}

      {type === 'Password' && (
        <div className="flex flex-wrap gap-4 mt-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={useUpper} onChange={(e) => setUseUpper(e.target.checked)} />
            Uppercase (A-Z)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={useLower} onChange={(e) => setUseLower(e.target.checked)} />
            Lowercase (a-z)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} />
            Numbers (0-9)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} />
            Symbols (!@#$...)
          </label>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Generated Secret</label>
        <div 
          className="min-h-[60px] font-mono text-sm bg-muted/50 rounded-2xl p-4 break-all"
          data-testid="secret-output"
        >
          {output}
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={generateSecret} className="bg-[#19D7C1] hover:bg-[#19D7C1]/90 text-black" data-testid="generate-btn">
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate
        </Button>
        <Button variant="outline" onClick={handleCopy} data-testid="copy-btn">
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </Button>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
        <ShieldCheck className="h-4 w-4" />
        Cryptographically secure — generated in your browser, never sent to a server
      </div>
    </div>
  );
}
