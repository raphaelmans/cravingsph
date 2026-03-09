"use client";

import { Copy, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type {
  BranchOperatingHour,
  WeekDayKey,
} from "../hooks/use-branch-settings";

interface WeeklyHoursEditorProps {
  hours: BranchOperatingHour[];
  onHourChange: (
    dayKey: WeekDayKey,
    updates: Partial<BranchOperatingHour>,
  ) => void;
  onApplyWeekdayTemplate: () => void;
  onReset: () => void;
}

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const hours = Math.floor(index / 2)
    .toString()
    .padStart(2, "0");
  const minutes = index % 2 === 0 ? "00" : "30";

  return `${hours}:${minutes}`;
});

export function WeeklyHoursEditor({
  hours,
  onHourChange,
  onApplyWeekdayTemplate,
  onReset,
}: WeeklyHoursEditorProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle>Operating Hours</CardTitle>
          <p className="text-sm text-muted-foreground">
            Set the storefront schedule your team plans to follow. Weekly hours
            are stored locally for now until branch scheduling fields are added
            to the backend.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onApplyWeekdayTemplate}
          >
            <Copy className="size-4" />
            Copy Monday to weekdays
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onReset}>
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {hours.map((day) => (
          <div
            key={day.dayKey}
            className="flex flex-col gap-3 rounded-xl border p-4 lg:flex-row lg:items-center"
          >
            <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
              <div>
                <p className="font-medium">{day.label}</p>
                <p className="text-sm text-muted-foreground">
                  {day.isClosed
                    ? "Closed all day"
                    : `${day.opensAt} to ${day.closesAt}`}
                </p>
              </div>
              <Badge variant={day.isClosed ? "outline" : "secondary"}>
                {day.isClosed ? "Closed" : "Open"}
              </Badge>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2">
                <Switch
                  checked={!day.isClosed}
                  onCheckedChange={(checked) =>
                    onHourChange(day.dayKey, { isClosed: !checked })
                  }
                  aria-label={`Toggle ${day.label} opening hours`}
                />
                <span className="text-sm font-medium">
                  {day.isClosed ? "Closed" : "Open"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:min-w-72">
                <Select
                  disabled={day.isClosed}
                  value={day.opensAt}
                  onValueChange={(value) =>
                    onHourChange(day.dayKey, { opensAt: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Opens" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((option) => (
                      <SelectItem
                        key={`${day.dayKey}-open-${option}`}
                        value={option}
                      >
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  disabled={day.isClosed}
                  value={day.closesAt}
                  onValueChange={(value) =>
                    onHourChange(day.dayKey, { closesAt: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Closes" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((option) => (
                      <SelectItem
                        key={`${day.dayKey}-close-${option}`}
                        value={option}
                      >
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
