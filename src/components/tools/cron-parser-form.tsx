'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import cronstrue from 'cronstrue';
import { Clock } from 'lucide-react';

const PRESETS = [
  { label: 'Every 5 min', expr: '*/5 * * * *' },
  { label: 'Hourly', expr: '0 * * * *' },
  { label: 'Weekdays 9am', expr: '0 9 * * 1-5' },
  { label: 'Daily midnight', expr: '0 0 * * *' },
  { label: 'Weekly Sunday', expr: '0 0 * * 0' }
];

function getNextRuns(expr: string, count: number): string[] {
  const parts = expr.split(' ');
  if (parts.length < 5) return [];
  const [min, hour, dom, month, dow] = parts;
  
  const match = (val: number, field: string) => {
    if (field === '*') return true;
    if (field.includes('-')) {
      const [start, end] = field.split('-').map(Number);
      return val >= start && val <= end;
    }
    if (field.includes(',')) {
      return field.split(',').map(Number).includes(val);
    }
    if (field.startsWith('*/')) {
      const step = Number(field.substring(2));
      return val % step === 0;
    }
    return val === Number(field);
  };

  const runs: string[] = [];
  let current = new Date();
  current.setSeconds(0, 0);
  current.setMinutes(current.getMinutes() + 1);

  let steps = 0;
  while (runs.length < count && steps < 10000) {
    steps++;
    const m = current.getMinutes();
    const h = current.getHours();
    const d = current.getDate();
    const mo = current.getMonth() + 1; // 1-12
    const dw = current.getDay(); // 0-6

    if (match(mo, month) && match(d, dom) && match(dw, dow) && match(h, hour) && match(m, min)) {
      runs.push(new Date(current).toISOString());
    }
    current.setMinutes(current.getMinutes() + 1);
  }

  return runs.length > 0 ? runs : ['Could not compute simple next runs'];
}

export function CronParserForm() {
  const [cronInput, setCronInput] = useState('0 9 * * 1-5');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [nextRuns, setNextRuns] = useState<string[]>([]);
  const [breakdown, setBreakdown] = useState<{field: string, value: string, meaning: string}[]>([]);

  useEffect(() => {
    parseCron(cronInput);
  }, [cronInput]);

  const parseCron = (expr: string) => {
    try {
      const desc = cronstrue.toString(expr, { throwExceptionOnParseError: true });
      setDescription(desc);
      setError('');
      
      const parts = expr.trim().split(/\s+/);
      if (parts.length >= 5) {
        setBreakdown([
          { field: 'Minute', value: parts[0], meaning: 'Minute of the hour' },
          { field: 'Hour', value: parts[1], meaning: 'Hour of the day' },
          { field: 'Day of Month', value: parts[2], meaning: 'Day of the month' },
          { field: 'Month', value: parts[3], meaning: 'Month of the year' },
          { field: 'Day of Week', value: parts[4], meaning: 'Day of the week' },
        ]);
        setNextRuns(getNextRuns(expr, 5));
      } else {
        setBreakdown([]);
        setNextRuns([]);
      }
    } catch (err: any) {
      setDescription('');
      setError(err.toString());
      setNextRuns([]);
      setBreakdown([]);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4">
      <div>
        <label className="block text-sm font-medium mb-1">Cron Expression</label>
        <Input 
          className="font-mono text-lg"
          placeholder="0 9 * * 1-5" 
          value={cronInput}
          onChange={(e) => setCronInput(e.target.value)}
          data-testid="cron-input"
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map(preset => (
          <button 
            key={preset.label}
            onClick={() => setCronInput(preset.expr)}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-[#19D7C1] hover:text-[#06131F] rounded-full border border-gray-200 transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {!error && description && (
        <div className="space-y-6">
          <div className="p-6 bg-teal-50 border border-[#19D7C1] rounded-lg">
            <h2 className="text-2xl font-bold text-[#06131F]" data-testid="cron-description">
              {description}
            </h2>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center text-[#06131F]">
              <Clock className="w-5 h-5 mr-2 text-[#19D7C1]" /> Next 5 runs
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-sm bg-gray-50 p-4 rounded-md border border-gray-200" data-testid="next-runs">
              {nextRuns.map((run, i) => <li key={i}>{run}</li>)}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-[#06131F]">Cron Field Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border border-gray-200">
                <thead className="bg-gray-100 text-[#06131F]">
                  <tr>
                    <th className="px-4 py-2 border-b">Field</th>
                    <th className="px-4 py-2 border-b">Value</th>
                    <th className="px-4 py-2 border-b">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((row, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-2 font-medium">{row.field}</td>
                      <td className="px-4 py-2 font-mono bg-gray-50">{row.value}</td>
                      <td className="px-4 py-2">{row.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
