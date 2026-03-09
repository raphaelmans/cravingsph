"use client";

import { useCallback } from "react";
import { OptionalBadge } from "@/components/brand/optional-badge";
import { Price } from "@/components/brand/price";
import { RequiredBadge } from "@/components/brand/required-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type {
  ModifierGroupRecord,
  ModifierRecord,
} from "@/shared/infra/db/schema";

interface ModifierGroupProps {
  group: ModifierGroupRecord;
  modifiers: ModifierRecord[];
  selected: string[];
  onSelectionChange: (groupId: string, modifierIds: string[]) => void;
}

export function ModifierGroup({
  group,
  modifiers,
  selected,
  onSelectionChange,
}: ModifierGroupProps) {
  const isSingleSelect = group.maxSelections === 1;
  const isMaxReached = selected.length >= group.maxSelections;

  const handleRadioChange = useCallback(
    (modifierId: string) => {
      onSelectionChange(group.id, [modifierId]);
    },
    [group.id, onSelectionChange],
  );

  const handleCheckboxToggle = useCallback(
    (modifierId: string, checked: boolean) => {
      if (checked) {
        onSelectionChange(group.id, [...selected, modifierId]);
      } else {
        onSelectionChange(
          group.id,
          selected.filter((id) => id !== modifierId),
        );
      }
    },
    [group.id, selected, onSelectionChange],
  );

  return (
    <div data-slot="modifier-group" className="space-y-3">
      {/* Group header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{group.name}</h3>
        {group.isRequired ? <RequiredBadge /> : <OptionalBadge />}
      </div>

      {/* Selection hint */}
      {group.maxSelections > 1 && (
        <p className="text-xs text-muted-foreground">
          {group.isRequired
            ? `Choose ${group.minSelections}–${group.maxSelections}`
            : `Choose up to ${group.maxSelections}`}
        </p>
      )}

      {/* Options */}
      {isSingleSelect ? (
        <RadioGroup
          value={selected[0] ?? ""}
          onValueChange={handleRadioChange}
          className="gap-0"
        >
          {modifiers.map((mod) => (
            <ModifierRadioOption key={mod.id} modifier={mod} />
          ))}
        </RadioGroup>
      ) : (
        <div className="space-y-0">
          {modifiers.map((mod) => (
            <ModifierCheckboxOption
              key={mod.id}
              modifier={mod}
              checked={selected.includes(mod.id)}
              disabled={!selected.includes(mod.id) && isMaxReached}
              onCheckedChange={(checked) =>
                handleCheckboxToggle(mod.id, checked)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ModifierRadioOption({ modifier }: { modifier: ModifierRecord }) {
  const price = Number(modifier.price);
  return (
    <Label
      htmlFor={modifier.id}
      className="flex cursor-pointer items-center justify-between py-2.5 font-normal"
    >
      <div className="flex items-center gap-3">
        <RadioGroupItem value={modifier.id} id={modifier.id} />
        <span className="text-sm">{modifier.name}</span>
      </div>
      {price > 0 && (
        <Price
          amount={price}
          className="text-xs font-normal text-muted-foreground"
        />
      )}
    </Label>
  );
}

function ModifierCheckboxOption({
  modifier,
  checked,
  disabled,
  onCheckedChange,
}: {
  modifier: ModifierRecord;
  checked: boolean;
  disabled: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const price = Number(modifier.price);
  return (
    <Label
      htmlFor={modifier.id}
      className="flex cursor-pointer items-center justify-between py-2.5 font-normal"
    >
      <div className="flex items-center gap-3">
        <Checkbox
          id={modifier.id}
          checked={checked}
          disabled={disabled}
          onCheckedChange={(val) => onCheckedChange(val === true)}
        />
        <span className="text-sm">{modifier.name}</span>
      </div>
      {price > 0 && (
        <Price
          amount={price}
          className="text-xs font-normal text-muted-foreground"
        />
      )}
    </Label>
  );
}
