'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Code, Check, Copy, AlertCircle } from 'lucide-react';

export function JsonFormatterForm() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState<{ keys: number, depth: number, size: number } | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const calculateStats = (obj: any, currentDepth: number = 1): { keys: number, maxDepth: number } => {
    if (typeof obj !== 'object' || obj === null) return { keys: 0, maxDepth: currentDepth };
    
    let keys = Array.isArray(obj) ? 0 : Object.keys(obj).length;
    let maxDepth = currentDepth;

    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        const childStats = calculateStats(obj[key], currentDepth + 1);
        keys += childStats.keys;
        maxDepth = Math.max(maxDepth, childStats.maxDepth);
      }
    }
    return { keys, maxDepth };
  };

  const processJson = (mode: 'prettify' | 'minify' | 'validate') => {
    setError('');
    setIsValid(null);
    setStats(null);
    
    if (!input.trim()) return;

    try {
      const parsed = JSON.parse(input);
      const size = new Blob([input]).size;
      const { keys, maxDepth } = calculateStats(parsed);
      
      setStats({ keys, depth: maxDepth, size });

      if (mode === 'prettify') {
        setOutput(JSON.stringify(parsed, null, 2));
      } else if (mode === 'minify') {
        setOutput(JSON.stringify(parsed));
      } else if (mode === 'validate') {
        setIsValid(true);
      }
    } catch (e: any) {
      setError(e.message);
      setIsValid(false);
      setOutput('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-[#06131F]">JSON Input</label>
        <textarea
          className="w-full min-h-[200px] font-mono p-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19D7C1]"
          placeholder="{...}"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          data-testid="json-input"
        />
        {error && (
          <div className="flex items-center text-red-500 text-sm mt-2 font-mono bg-red-50 p-2 rounded-md" data-testid="json-error">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> 
            <span>{error}</span>
          </div>
        )}
        {isValid && (
          <div className="flex items-center text-[#19D7C1] text-sm mt-2 bg-[#19D7C1]/10 p-2 rounded-md border border-[#19D7C1]/20">
            <Check className="w-4 h-4 mr-2" /> Valid JSON
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => processJson('prettify')} data-testid="prettify-btn" className="bg-[#19D7C1] hover:bg-[#19D7C1]/90 text-[#06131F]">
          <Code className="w-4 h-4 mr-2" /> Prettify
        </Button>
        <Button onClick={() => processJson('minify')} data-testid="minify-btn" variant="outline" className="border-[#06131F] text-[#06131F]">
          Minify
        </Button>
        <Button onClick={() => processJson('validate')} data-testid="validate-btn" variant="outline" className="border-[#06131F] text-[#06131F]">
          Validate
        </Button>
      </div>

      {output && (
        <div className="space-y-2 mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-[#06131F]">Output</h3>
            <div className="flex items-center space-x-4">
              {stats && (
                <div className="text-xs text-gray-500 flex space-x-3 bg-gray-100 px-3 py-1 rounded-full">
                  <span><strong>Keys:</strong> {stats.keys}</span>
                  <span><strong>Depth:</strong> {stats.depth}</span>
                  <span><strong>Size:</strong> {stats.size} B</span>
                </div>
              )}
              <Button onClick={copyToClipboard} variant="ghost" size="sm" className="h-8 text-[#06131F] hover:bg-gray-100">
                <Copy className="w-4 h-4 mr-1" /> Copy
              </Button>
            </div>
          </div>
          <textarea
            className="w-full min-h-[200px] font-mono p-3 rounded-md border border-gray-200 bg-gray-50 text-sm cursor-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19D7C1]"
            value={output}
            readOnly
            data-testid="json-output"
          />
        </div>
      )}
    </div>
  );
}
