"use client";

import { Copy, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useMemo } from "react";
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
import {
  type BranchOperatingHour,
  WEEK_DAY_KEYS,
  type WeekDayKey,
} from "../hooks/use-branch-settings";

interface WeeklyHoursEditorProps {
  hours: BranchOperatingHour[];
  onHourChange: (
    dayKey: WeekDayKey,
    slotIndex: number,
    updates: Partial<BranchOperatingHour>,
  ) => void;
  onAddTimeSlot: (dayKey: WeekDayKey) => void;
  onRemoveTimeSlot: (dayKey: WeekDayKey, slotIndex: number) => void;
  onApplyWeekdayTemplate: () => void;
  onReset: () => void;
  onSave: () => void;
  isSaving: boolean;
}

const MAX_SLOTS_PER_DAY = 4;

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const hours = Math.floor(index / 2)
    .toString()
    .padStart(2, "0");
  const minutes = index % 2 === 0 ? "00" : "30";

  return `${hours}:${minutes}`;
});

interface DayGroup {
  dayKey: WeekDayKey;
  label: string;
  slots: BranchOperatingHour[];
}

export function WeeklyHoursEditor({
  hours,
  onHourChange,
  onAddTimeSlot,
  onRemoveTimeSlot,
  onApplyWeekdayTemplate,
  onReset,
  onSave,
  isSaving,
}: WeeklyHoursEditorProps) {
  const dayGroups: DayGroup[] = useMemo(() => {
    const grouped = new Map<WeekDayKey, BranchOperatingHour[]>();

    for (const dayKey of WEEK_DAY_KEYS) {
      grouped.set(dayKey, []);
    }

    for (const hour of hours) {
      const slots = grouped.get(hour.dayKey);
      if (slots) {
        slots.push(hour);
      }
    }

    return WEEK_DAY_KEYS.map((dayKey) => {
      const slots = grouped.get(dayKey) ?? [];
      return {
        dayKey,
        label:
          slots[0]?.label ?? dayKey.charAt(0).toUpperCase() + dayKey.slice(1),
        slots: slots.sort((a, b) => a.slotIndex - b.slotIndex),
      };
    });
  }, [hours]);

  return (
    <Card className="border-border/70 bg-background/95">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="font-heading text-xl font-semibold tracking-tight">
            Operating hours
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Set the storefront schedule your team plans to follow. Changes are
            saved when you press the save button below.
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

      <CardContent className="space-y-4">
        {dayGroups.map((group) => {
          const primarySlot = group.slots[0];
          const isClosed = primarySlot?.isClosed ?? true;

          return (
            <div key={group.dayKey} className="rounded-3xl border p-4">
              {/* Day header with label, badge, and open/closed toggle */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{group.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {isClosed
                        ? "Closed all day"
                        : group.slots
                            .map((s) => `${s.opensAt} to ${s.closesAt}`)
                            .join(", ")}
                    </p>
                  </div>
                  <Badge variant={isClosed ? "outline" : "secondary"}>
                    {isClosed ? "Closed" : "Open"}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 rounded-3xl border bg-muted/30 px-4 py-2">
                  <Switch
                    checked={!isClosed}
                    onCheckedChange={(checked) =>
                      onHourChange(group.dayKey, 0, { isClosed: !checked })
                    }
                    aria-label={`Toggle ${group.label} opening hours`}
                  />
                  <span className="text-sm font-medium">
                    {isClosed ? "Closed" : "Open"}
                  </span>
                </div>
              </div>

              {/* Time slots */}
              {!isClosed && (
                <div className="mt-4 space-y-3">
                  {group.slots.map((slot) => (
                    <div
                      key={`${slot.dayKey}-${slot.slotIndex}`}
                      className="flex flex-col gap-2 sm:flex-row sm:items-center"
                    >
                      {group.slots.length > 1 && (
                        <span className="shrink-0 text-xs font-medium text-muted-foreground sm:w-16">
                          Slot {slot.slotIndex + 1}
                        </span>
                      )}

                      <div className="grid flex-1 grid-cols-2 gap-2 sm:min-w-72">
                        <Select
                          value={slot.opensAt}
                          onValueChange={(value) =>
                            onHourChange(slot.dayKey, slot.slotIndex, {
                              opensAt: value,
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Opens" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map((option) => (
                              <SelectItem
                                key={`${slot.dayKey}-${slot.slotIndex}-open-${option}`}
                                value={option}
                              >
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={slot.closesAt}
                          onValueChange={(value) =>
                            onHourChange(slot.dayKey, slot.slotIndex, {
                              closesAt: value,
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Closes" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map((option) => (
                              <SelectItem
                                key={`${slot.dayKey}-${slot.slotIndex}-close-${option}`}
                                value={option}
                              >
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {group.slots.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="shrink-0 text-destructive hover:text-destructive"
                          onClick={() =>
                            onRemoveTimeSlot(slot.dayKey, slot.slotIndex)
                          }
                          aria-label={`Remove time slot ${slot.slotIndex + 1} for ${group.label}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {group.slots.length < MAX_SLOTS_PER_DAY && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={() => onAddTimeSlot(group.dayKey)}
                    >
                      <Plus className="size-4" />
                      Add time slot
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <Button onClick={onSave} disabled={isSaving} className="w-full">
          {isSaving ? "Saving..." : "Save operating hours"}
        </Button>
      </CardContent>
    </Card>
  );
}
