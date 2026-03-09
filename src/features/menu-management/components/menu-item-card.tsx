"use client";

import {
  Edit,
  ImageOff,
  Layers,
  MoreVertical,
  Settings2,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { Price } from "@/components/brand/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import type { ManagementMenuItem } from "../types";

interface MenuItemManagementCardProps {
  item: ManagementMenuItem;
  onToggleAvailability: (id: string, isAvailable: boolean) => void;
  onEdit: (item: ManagementMenuItem) => void;
  onManageVariants: (item: ManagementMenuItem) => void;
  onManageModifiers: (item: ManagementMenuItem) => void;
  onDelete: (id: string) => void;
  isToggling?: boolean;
}

export function MenuItemManagementCard({
  item,
  onToggleAvailability,
  onEdit,
  onManageVariants,
  onManageModifiers,
  onDelete,
  isToggling,
}: MenuItemManagementCardProps) {
  const { item: menuItem, variants, modifierGroups } = item;

  return (
    <Card className={!menuItem.isAvailable ? "opacity-60" : undefined}>
      <CardContent className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
          {menuItem.imageUrl ? (
            <Image
              src={menuItem.imageUrl}
              alt={menuItem.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <ImageOff className="size-6 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-medium leading-tight truncate">
                {menuItem.name}
              </h3>
              {menuItem.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {menuItem.description}
                </p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 shrink-0">
                  <MoreVertical className="size-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Edit className="mr-2 size-4" />
                  Edit Item
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onManageVariants(item)}>
                  <Layers className="mr-2 size-4" />
                  Variants
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onManageModifiers(item)}>
                  <Settings2 className="mr-2 size-4" />
                  Modifiers
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(menuItem.id)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Price + meta */}
          <div className="flex items-center gap-2 mt-auto">
            <Price amount={Number(menuItem.basePrice)} />
            {variants.length > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {variants.length} variant{variants.length !== 1 ? "s" : ""}
              </Badge>
            )}
            {modifierGroups.length > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {modifierGroups.length} modifier group
                {modifierGroups.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {/* Availability toggle */}
          <div className="flex items-center gap-2 mt-1">
            <Switch
              checked={menuItem.isAvailable}
              onCheckedChange={(checked) =>
                onToggleAvailability(menuItem.id, checked)
              }
              disabled={isToggling}
              className="scale-75 origin-left"
            />
            <span className="text-xs text-muted-foreground">
              {menuItem.isAvailable ? "Available" : "Unavailable"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
