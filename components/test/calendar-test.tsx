'use client';

import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function CalendarTest() {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Calendar Test Component</h2>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Test Date Picker:</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                console.log('Calendar date selected:', selectedDate);
                setDate(selectedDate);
              }}
              initialFocus
              className="rounded-md border"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {date && (
        <div className="p-4 bg-green-100 rounded-md">
          <p className="text-sm font-medium text-green-800">
            Selected Date: {format(date, "PPP")}
          </p>
        </div>
      )}
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Direct Calendar (No Popover)</h3>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            console.log('Direct calendar date selected:', selectedDate);
            setDate(selectedDate);
          }}
          className="rounded-md border"
        />
      </div>
    </div>
  );
}