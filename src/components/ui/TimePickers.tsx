import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

export default function TimePicker() {
  const [open, setOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<number | null>(null);
  const [focusedHour, setFocusedHour] = useState(0);
  const [focusedMinute, setFocusedMinute] = useState(0);
  const [activeColumn, setActiveColumn] = useState<'hours' | 'minutes'>('hours');
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  const listClassName = "max-h-[200px] overflow-y-auto flex flex-col";

  useEffect(() => {
    if (open) {
      setFocusedHour(selectedHour ?? 0);
      setFocusedMinute(selectedMinute ?? 0);
      setActiveColumn('hours');
      setTimeout(() => {
        scrollToSelected();
      }, 0);
    }
  }, [open, selectedHour, selectedMinute]);

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

  const scrollToSelected = () => {
    if (hoursRef.current && selectedHour !== null) {
      const hourElement = hoursRef.current.children[selectedHour] as HTMLElement;
      hourElement.scrollIntoView({ block: 'center' });
    }
    if (minutesRef.current && selectedMinute !== null) {
      const minuteElement = minutesRef.current.children[selectedMinute] as HTMLElement;
      minuteElement.scrollIntoView({ block: 'center' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (activeColumn === 'hours') {
          setFocusedHour((prev) => (prev > 0 ? prev - 1 : 23));
        } else {
          setFocusedMinute((prev) => (prev > 0 ? prev - 1 : 59));
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (activeColumn === 'hours') {
          setFocusedHour((prev) => (prev < 23 ? prev + 1 : 0));
        } else {
          setFocusedMinute((prev) => (prev < 59 ? prev + 1 : 0));
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setActiveColumn('hours');
        break;
      case 'ArrowRight':
        e.preventDefault();
        setActiveColumn('minutes');
        break;
      case 'Enter':
        e.preventDefault();
        selectTime(focusedHour, focusedMinute);
        break;
    }
  };

  const selectTime = (hour: number, minute: number) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
  };

  const getFormattedTime = () => {
    if (selectedHour === null || selectedMinute === null) return null;
    return `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !getFormattedTime() && "text-muted-foreground"
          )}
        >
          <ClockIcon className="mr-2 h-4 w-4" />
          {getFormattedTime() || "Pick a time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[160px] p-0" onKeyDown={handleKeyDown}>
        <div className="grid grid-cols-2 gap-2 px-2">
          <div
            ref={hoursRef}
            className={listClassName}
            style={{ scrollbarWidth: "none" }}
          >
            {HOURS.map((hour, index) => (
              <button
                key={hour}
                className={cn(
                  "hover:bg-muted p-2 rounded-md",
                  (activeColumn === 'hours' && focusedHour === index) && "bg-muted",
                  selectedHour === hour && "bg-primary text-primary-foreground pointer-events-none"
                )}
                onClick={() => selectTime(hour, selectedMinute ?? focusedMinute)}
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
                  "hover:bg-muted p-2 rounded-md",
                  (activeColumn === 'minutes' && focusedMinute === index) && "bg-muted",
                  selectedMinute === minute && "bg-primary text-primary-foreground pointer-events-none"
                )}
                onClick={() => selectTime(selectedHour ?? focusedHour, minute)}
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