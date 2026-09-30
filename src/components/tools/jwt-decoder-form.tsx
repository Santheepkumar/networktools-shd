'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function JwtDecoderForm() {
  const [input, setInput] = React.useState('');
  const [header, setHeader] = React.useState<any>(null);
  const [payload, setPayload] = React.useState<any>(null);
  const [error, setError] = React.useState('');

  const parseBase64Url = (str: string) => {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  };

  const handleDecode = () => {
    setError('');
    setHeader(null);
    setPayload(null);
    
    try {
      const parts = input.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format.');
      }
      const decodedHeader = parseBase64Url(parts[0]);
      const decodedPayload = parseBase64Url(parts[1]);
      
      setHeader(decodedHeader);
      setPayload(decodedPayload);
    } catch (e) {
      setError('Invalid JWT format. Token must have 3 parts split by "." and be valid Base64Url.');
    }
  };

  const getExpiry = () => {
    if (!payload || !payload.exp) return null;
    const date = new Date(payload.exp * 1000);
    const isExpired = date < new Date();
    
    return {
      date: date.toLocaleString(),
      isExpired
    };
  };

  const expiry = getExpiry();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">JWT Token</label>
        <textarea
          className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          data-testid="jwt-input"
        />
      </div>

      <Button onClick={handleDecode} className="bg-[#19D7C1] hover:bg-[#19D7C1]/90 text-black" data-testid="decode-btn">
        <RefreshCw className="mr-2 h-4 w-4" />
        Decode JWT
      </Button>

      {error && <div className="text-sm text-destructive mt-2">{error}</div>}

      {header && payload && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-muted/50 p-4" data-testid="jwt-header">
            <h3 className="text-sm font-semibold mb-2">Header</h3>
            <pre className="font-mono text-sm overflow-auto">
              {JSON.stringify(header, null, 2)}
            </pre>
          </div>
          
          <div className="rounded-2xl bg-muted/50 p-4" data-testid="jwt-payload">
            <h3 className="text-sm font-semibold mb-2">Payload</h3>
            <pre className="font-mono text-sm overflow-auto">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
          
          {expiry && (
            <div className="rounded-2xl bg-muted/50 p-4" data-testid="jwt-expiry">
              <h3 className="text-sm font-semibold mb-2">Expiry</h3>
              <div className="flex items-center gap-2 text-sm">
                <span>Expires: {expiry.date}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${expiry.isExpired ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-700'}`}>
                  {expiry.isExpired ? 'Expired' : 'Valid'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
