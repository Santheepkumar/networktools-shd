'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, ArrowDown } from 'lucide-react';

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 
  'Asia/Kolkata', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney', 'America/Chicago', 
  'America/Denver', 'Pacific/Auckland', 'America/Sao_Paulo', 'Africa/Cairo', 'Asia/Dubai', 
  'Asia/Singapore', 'Europe/Berlin', 'America/Toronto', 'America/Vancouver', 'Pacific/Honolulu'
];

export function UnixTimestampForm() {
  const [currentTs, setCurrentTs] = useState<number>(Math.floor(Date.now() / 1000));
  
  const [timestampInput, setTimestampInput] = useState<string>('');
  const [selectedTz, setSelectedTz] = useState<string>('UTC');
  const [dateOutput, setDateOutput] = useState<{ iso: string, local: string, relative: string } | null>(null);

  const [dateInput, setDateInput] = useState<string>('');
  const [tsOutput, setTsOutput] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTs(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTsToDate = () => {
    if (!timestampInput) return;
    const num = parseInt(timestampInput, 10);
    if (isNaN(num)) return;
    const date = new Date(num * 1000);
    try {
      const local = new Intl.DateTimeFormat('en-US', {
        timeZone: selectedTz,
        dateStyle: 'full',
        timeStyle: 'long'
      }).format(date);
      
      const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
      const daysDifference = Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const relative = rtf.format(daysDifference, 'day');

      setDateOutput({ iso: date.toISOString(), local, relative });
    } catch (e) {
      setDateOutput(null);
    }
  };

  const handleDateToTs = () => {
    if (!dateInput) return;
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return;
    setTsOutput(Math.floor(date.getTime() / 1000));
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto p-4">
      <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 p-3 rounded-md">
        <Clock className="w-5 h-5 text-[#19D7C1]" />
        <span>Current Unix Timestamp: <strong>{currentTs}</strong></span>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#06131F]">Unix Timestamp → Date</h3>
        <div>
          <label className="block text-sm font-medium mb-1">Unix Timestamp (seconds)</label>
          <Input 
            type="number" 
            placeholder="1700000000" 
            value={timestampInput}
            onChange={(e) => setTimestampInput(e.target.value)}
            data-testid="timestamp-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Timezone</label>
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedTz}
            onChange={(e) => setSelectedTz(e.target.value)}
          >
            {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>
        <Button onClick={handleTsToDate} data-testid="ts-to-date-btn" className="bg-[#19D7C1] hover:bg-[#19D7C1]/90 text-[#06131F]">
          <ArrowDown className="w-4 h-4 mr-2" /> Convert
        </Button>
        {dateOutput && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md space-y-2" data-testid="date-output">
            <p className="text-sm"><strong>ISO:</strong> {dateOutput.iso}</p>
            <p className="text-sm"><strong>Local ({selectedTz}):</strong> {dateOutput.local}</p>
            <p className="text-sm"><strong>Relative:</strong> {dateOutput.relative}</p>
          </div>
        )}
      </div>

      <div className="relative flex py-5 items-center">
        <div className="flex-grow border-t border-[#19D7C1]"></div>
        <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">or</span>
        <div className="flex-grow border-t border-[#19D7C1]"></div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#06131F]">Date → Unix Timestamp</h3>
        <div>
          <label className="block text-sm font-medium mb-1">Date & Time</label>
          <Input 
            type="datetime-local" 
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            data-testid="date-input"
          />
        </div>
        <Button onClick={handleDateToTs} data-testid="date-to-ts-btn" className="bg-[#19D7C1] hover:bg-[#19D7C1]/90 text-[#06131F]">
          <ArrowDown className="w-4 h-4 mr-2" /> Convert
        </Button>
        {tsOutput !== null && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md" data-testid="ts-output">
            <p className="text-sm"><strong>Unix Timestamp:</strong> {tsOutput}</p>
          </div>
        )}
      </div>
    </div>
  );
}
