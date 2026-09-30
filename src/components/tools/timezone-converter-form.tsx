'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, ArrowRight } from 'lucide-react';

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 
  'America/Toronto', 'America/Vancouver', 'America/Sao_Paulo', 'Europe/London', 'Europe/Paris', 
  'Europe/Berlin', 'Europe/Amsterdam', 'Europe/Moscow', 'Africa/Cairo', 'Africa/Lagos', 
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Colombo', 'Asia/Bangkok', 'Asia/Singapore', 
  'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Seoul', 'Australia/Sydney', 'Pacific/Auckland', 
  'Pacific/Honolulu'
];

export function TimezoneConverterForm() {
  const [dateInput, setDateInput] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [sourceTz, setSourceTz] = useState('UTC');
  const [results, setResults] = useState<{ tz: string, date: string, time: string, offset: string }[]>([]);

  const handleConvert = () => {
    if (!dateInput) return;
    const localDate = new Date(dateInput);
    
    const newResults = TIMEZONES.map(tz => {
      try {
        const dateFormatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, dateStyle: 'medium' });
        const timeFormatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeStyle: 'short' });
        const offsetFormatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' });
        
        const dateStr = dateFormatter.format(localDate);
        const timeStr = timeFormatter.format(localDate);
        const offsetStr = offsetFormatter.formatToParts(localDate).find(p => p.type === 'timeZoneName')?.value || '';

        return {
          tz,
          date: dateStr,
          time: timeStr,
          offset: offsetStr
        };
      } catch (e) {
        return { tz, date: 'Error', time: '', offset: '' };
      }
    });

    setResults(newResults);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date & Time</label>
          <Input 
            type="datetime-local" 
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            data-testid="datetime-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">From Timezone</label>
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={sourceTz}
            onChange={(e) => setSourceTz(e.target.value)}
            data-testid="source-tz"
          >
            {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>
      </div>

      <Button onClick={handleConvert} data-testid="convert-btn" className="bg-[#19D7C1] hover:bg-[#19D7C1]/90 text-[#06131F]">
        <Globe className="w-4 h-4 mr-2" /> Convert
      </Button>

      {results.length > 0 && (
        <div className="overflow-x-auto mt-6">
          <table className="w-full text-sm text-left border border-gray-200" data-testid="tz-table">
            <thead className="bg-gray-100 text-[#06131F]">
              <tr>
                <th className="px-4 py-3 border-b">Timezone</th>
                <th className="px-4 py-3 border-b">Date</th>
                <th className="px-4 py-3 border-b">Time</th>
                <th className="px-4 py-3 border-b">Offset</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className={`border-b ${r.tz === sourceTz ? 'bg-[#19D7C1]/20' : 'bg-white'}`}>
                  <td className="px-4 py-3 font-medium text-[#06131F]">{r.tz}</td>
                  <td className="px-4 py-3">{r.date}</td>
                  <td className="px-4 py-3 font-medium">{r.time}</td>
                  <td className="px-4 py-3 text-gray-600">{r.offset}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
