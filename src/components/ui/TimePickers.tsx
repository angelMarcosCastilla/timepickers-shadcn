import React, { useEffect, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

interface TimePickerProps {
  value: string | null;
  onChange: (time: string | null) => void;
  minTime?: string;
}

export default function TimePicker({ value, onChange, minTime }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [focusedHour, setFocusedHour] = useState(0);
  const [focusedMinute, setFocusedMinute] = useState(0);
  const [activeColumn, setActiveColumn] = useState<'hours' | 'minutes'>('hours');
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  const listClassName = "max-h-[200px] overflow-y-auto flex flex-col px-2";

  const parseTime = (timeString: string | null): [number, number] => {
    if (!timeString) return [0, 0];
    const [hours, minutes] = timeString.split(':').map(Number);
    return [hours, minutes];
  };

  const [selectedHour, selectedMinute] = parseTime(value);

  const parseMinTime = (minTimeString: string | undefined): [number, number] => {
    if (!minTimeString) return [0, 0];
    const [hours, minutes] = minTimeString.split(':').map(Number);
    return [hours, minutes];
  };

  const [minHour, minMinute] = parseMinTime(minTime);

  useEffect(() => {
    if (open) {
      setFocusedHour(Math.max(selectedHour, minHour));
      setFocusedMinute(
        selectedHour > minHour ? selectedMinute : 
        selectedHour === minHour ? Math.max(selectedMinute, minMinute) : 
        0
      );
      setActiveColumn('hours');
      setTimeout(() => {
        scrollToSelected();
      }, 0);
    }
  }, [open, selectedHour, selectedMinute, minHour, minMinute]);

  const scrollToSelected = () => {
    if (hoursRef.current) {
      const hourElement = hoursRef.current.children[focusedHour] as HTMLElement;
      hourElement.scrollIntoView({ block: 'center' });
    }
    if (minutesRef.current) {
      const minuteElement = minutesRef.current.children[focusedMinute] as HTMLElement;
      minuteElement.scrollIntoView({ block: 'center' });
    }
  };

  const isHourDisabled = (hour: number) => {
    return hour < minHour;
  };

  const isMinuteDisabled = (hour: number, minute: number) => {
    if (hour > minHour) return false;
    if (hour === minHour) return minute < minMinute;
    return true;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (activeColumn === 'hours') {
          setFocusedHour((prev) => {
            let next = prev > 0 ? prev - 1 : 23;
            while (next < minHour) {
              next = next > 0 ? next - 1 : 23;
            }
            return next;
          });
        } else {
          setFocusedMinute((prev) => {
            if (focusedHour > minHour) {
              return prev > 0 ? prev - 1 : 59;
            } else if (focusedHour === minHour) {
              return Math.max(minMinute, prev > minMinute ? prev - 1 : 59);
            } else {
              return 59;
            }
          });
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (activeColumn === 'hours') {
          setFocusedHour((prev) => {
            let next = prev < 23 ? prev + 1 : 0;
            while (next < minHour) {
              next = next < 23 ? next + 1 : 0;
            }
            return next;
          });
        } else {
          setFocusedMinute((prev) => {
            if (focusedHour > minHour) {
              return prev < 59 ? prev + 1 : 0;
            } else if (focusedHour === minHour) {
              return prev < 59 ? Math.max(minMinute, prev + 1) : minMinute;
            } else {
              return minMinute;
            }
          });
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setActiveColumn('hours');
        break;
      case 'ArrowRight':
        e.preventDefault();
        setActiveColumn('minutes');
        if (focusedHour === minHour && focusedMinute < minMinute) {
          setFocusedMinute(minMinute);
        }
        break;
      case 'Enter':
        e.preventDefault();
        selectTime(focusedHour, focusedMinute);
        break;
    }
  };

  useEffect(() => {
    if (open) {
      if (activeColumn === 'hours' && hoursRef.current) {
        const hourElement = hoursRef.current.children[focusedHour] as HTMLElement;
        hourElement.scrollIntoView({ block: 'nearest' });
      } else if (activeColumn === 'minutes' && minutesRef.current) {
        const minuteElement = minutesRef.current.children[focusedMinute] as HTMLElement;
        minuteElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedHour, focusedMinute, activeColumn, open]);

  const selectTime = (hour: number, minute: number) => {
    if (hour === minHour && minute < minMinute) {
      minute = minMinute;
    }
    onChange(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <ClockIcon className="mr-2 h-4 w-4" />
          {value || "Pick a time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[160px] p-0" onKeyDown={handleKeyDown}>
        <div className="grid grid-cols-2 ">
          <div
            ref={hoursRef}
            className={listClassName}
            style={{ scrollbarWidth: "none" }}
          >
            {HOURS.map((hour, index) => (
              <button
                key={hour}
                className={cn(
                  "hover:bg-muted p-2 rounded-md text-sm",
                  (activeColumn === 'hours' && focusedHour === index) && "bg-muted",
                  selectedHour === hour && "bg-primary text-primary-foreground pointer-events-none",
                  isHourDisabled(hour) && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !isHourDisabled(hour) && selectTime(hour, selectedMinute)}
                disabled={isHourDisabled(hour)}
              >
                {hour.toString().padStart(2, '0')}
              </button>
            ))}
          </div>
          <div
            ref={minutesRef}
            className={listClassName}
            style={{ scrollbarWidth: "none" }}
          >
            {MINUTES.map((minute, index) => (
              <button
                key={minute}
                className={cn(
                  "hover:bg-muted p-2 rounded-md text-sm",
                  (activeColumn === 'minutes' && focusedMinute === index) && "bg-muted",
                  selectedMinute === minute && "bg-primary text-primary-foreground pointer-events-none",
                  isMinuteDisabled(selectedHour, minute) && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !isMinuteDisabled(selectedHour, minute) && selectTime(selectedHour, minute)}
                disabled={isMinuteDisabled(selectedHour, minute)}
              >
                {minute.toString().padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
