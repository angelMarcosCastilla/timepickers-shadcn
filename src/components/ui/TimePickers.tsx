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

export default function TimePicker({
  value,
  onChange,
  minTime,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [focusedHour, setFocusedHour] = useState(0);
  const [focusedMinute, setFocusedMinute] = useState(0);
  const [activeColumn, setActiveColumn] = useState<"hours" | "minutes">(
    "hours"
  );
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  const listClassName = "max-h-[200px] overflow-y-auto flex flex-col px-3";

  const parseTime = (timeString: string | null): [number, number] => {
    if (!timeString) return [0, 0];
    const [hours, minutes] = timeString.split(":").map(Number);
    return [hours, minutes];
  };

  const parseMinTime = (
    minTimeString: string | undefined
  ): [number, number] => {
    if (!minTimeString) return [0, 0];
    const [hours, minutes] = minTimeString.split(":").map(Number);
    return [hours, minutes];
  };

  const [selectedHour, selectedMinute] = parseTime(value);

  const [minHour, minMinute] = parseMinTime(minTime);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        if (activeColumn === "hours") {
          setFocusedHour((prev) => {
            const next = prev > 0 ? prev - 1 : 23;
            if (isDisabledHour(next)) {
              return 23;
            }
            return next;
          });
        } else {
          setFocusedMinute((prev) => {
            const next = prev > 0 ? prev - 1 : 59;
            if (disabledMinute(selectedHour, next)) {
              return 59;
            }
            return next;
          });
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (activeColumn === "hours") {
          setFocusedHour((prev) => {
            const next = prev < 23 ? prev + 1 : 0;
            if (isDisabledHour(next)) {
              return minHour;
            }
            return next;
          });
        } else {
          setFocusedMinute((prev) => {
            const next = prev < 59 ? prev + 1 : 0;
            if (disabledMinute(selectedHour, next)) {
              return minMinute;
            }
            return next;
          });
        }
        break;
      case "ArrowLeft":
        e.preventDefault();
        setActiveColumn("hours");
        setFocusedMinute(() => selectedMinute);
        break;
      case "ArrowRight":
        e.preventDefault();
        setFocusedHour(() => selectedHour);
        setActiveColumn("minutes");
        break;
      case "Enter":
        e.preventDefault();
        selectTime(focusedHour, focusedMinute);
        break;
    }
  };

  function isDisabledHour(hour: number) {
    return hour < minHour;
  }

  function disabledMinute(hour: number, minute: number) {
    if (hour === minHour) return minute < minMinute;
    return false;
  }

  useEffect(() => {
    if (open) {
      if (activeColumn === "hours" && hoursRef.current) {
        const hourElement = hoursRef.current.children[
          focusedHour
        ] as HTMLElement;
        hourElement.scrollIntoView({ block: "nearest" });
      } else if (activeColumn === "minutes" && minutesRef.current) {
        const minuteElement = minutesRef.current.children[
          focusedMinute
        ] as HTMLElement;
        minuteElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [focusedHour, focusedMinute, activeColumn, open]);

  useEffect(() => {
    if (open) {
      setFocusedHour(selectedHour ?? 0);
      setFocusedMinute(selectedMinute ?? 0);
      setActiveColumn("hours");
      setTimeout(() => {
        minutesRef.current?.children[selectedMinute]?.scrollIntoView({
          block: "center",
        });
        hoursRef.current?.children[selectedHour]?.scrollIntoView({
          block: "center",
        });
      }, 0);
    }
  }, [open]);

  const selectTime = (hour: number, minute: number) => {
    // validamos que el minuto selecionado no se menor que el minuto mínimo
    if (hour === minHour && minute < minMinute) {
      minutesRef.current?.children[minMinute]?.scrollIntoView({
        block: "center",
      });
      minute = minMinute;
    }

    onChange(
      `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`
    );
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
        <div className="grid grid-cols-2">
          <div
            ref={hoursRef}
            className={listClassName}
            style={{ scrollbarWidth: "none" }}
          >
            {HOURS.map((hour, index) => (
              <button
                key={hour}
                className={cn(
                  "hover:bg-muted p-2 rounded-md text-sm disabled:opacity-50 disabled:line-through ",
                  activeColumn === "hours" &&
                    focusedHour === index &&
                    "bg-muted outline  outline-1",
                  selectedHour === hour &&
                    "bg-primary text-primary-foreground pointer-events-none"
                )}
                disabled={isDisabledHour(hour)}
                onClick={() => {
                  selectTime(hour, selectedMinute);
                }}
              >
                {hour.toString().padStart(2, "0")}
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
                  "hover:bg-muted p-2 rounded-md text-sm disabled:opacity-50 disabled:line-through ",
                  activeColumn === "minutes" &&
                    focusedMinute === index &&
                    "bg-muted outline  outline-1 ",
                  selectedMinute === minute &&
                    "bg-primary text-primary-foreground pointer-events-none"
                )}
                disabled={disabledMinute(selectedHour, minute)}
                onClick={() => selectTime(selectedHour, minute)}
              >
                {minute.toString().padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
