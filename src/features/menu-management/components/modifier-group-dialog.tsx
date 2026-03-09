"use client";

import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useCreateModifier,
  useCreateModifierGroup,
  useDeleteModifier,
  useDeleteModifierGroup,
  useUpdateModifierGroup,
} from "../hooks/use-management-menu";
import type { ManagementMenuItem } from "../types";

interface ModifierGroupDialogProps {
  branchId: string;
  item: ManagementMenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModifierGroupDialog({
  branchId,
  item,
  open,
  onOpenChange,
}: ModifierGroupDialogProps) {
  const createGroupMutation = useCreateModifierGroup(branchId);
  const updateGroupMutation = useUpdateModifierGroup(branchId);
  const deleteGroupMutation = useDeleteModifierGroup(branchId);
  const createModifierMutation = useCreateModifier(branchId);
  const deleteModifierMutation = useDeleteModifier(branchId);

  const [newGroupName, setNewGroupName] = useState("");
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [newModifierName, setNewModifierName] = useState("");
  const [newModifierPrice, setNewModifierPrice] = useState("");

  const modifierGroups = item?.modifierGroups ?? [];

  function handleAddGroup() {
    if (!item || !newGroupName.trim()) return;

    createGroupMutation.mutate(
      { menuItemId: item.item.id, name: newGroupName.trim() },
      {
        onSuccess: () => {
          setNewGroupName("");
          toast.success("Modifier group added");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleDeleteGroup(groupId: string) {
    deleteGroupMutation.mutate(
      { id: groupId },
      {
        onSuccess: () => {
          if (expandedGroupId === groupId) setExpandedGroupId(null);
          toast.success("Modifier group removed");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleToggleRequired(groupId: string, isRequired: boolean) {
    updateGroupMutation.mutate(
      { id: groupId, isRequired },
      {
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleAddModifier(groupId: string) {
    if (!newModifierName.trim()) return;

    createModifierMutation.mutate(
      {
        modifierGroupId: groupId,
        name: newModifierName.trim(),
        price: newModifierPrice.trim() || undefined,
      },
      {
        onSuccess: () => {
          setNewModifierName("");
          setNewModifierPrice("");
          toast.success("Modifier added");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleDeleteModifier(modifierId: string) {
    deleteModifierMutation.mutate(
      { id: modifierId },
      {
        onSuccess: () => toast.success("Modifier removed"),
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleModifierKeyDown(e: React.KeyboardEvent, groupId: string) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddModifier(groupId);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Modifier Groups</DialogTitle>
          <DialogDescription>
            {item
              ? `Modifier groups for "${item.item.name}" (e.g., "Choose your sauce", "Add-ons").`
              : "Select an item to manage modifiers."}
          </DialogDescription>
        </DialogHeader>

        {item && (
          <div className="space-y-4">
            {/* Existing modifier groups */}
            {modifierGroups.map((mg) => {
              const isExpanded = expandedGroupId === mg.group.id;
              return (
                <div key={mg.group.id} className="rounded-md border">
                  {/* Group header */}
                  <div className="flex items-center gap-2 px-3 py-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 shrink-0"
                      onClick={() =>
                        setExpandedGroupId(isExpanded ? null : mg.group.id)
                      }
                    >
                      {isExpanded ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                    </Button>
                    <span className="flex-1 text-sm font-medium">
                      {mg.group.name}
                    </span>
                    {mg.group.isRequired && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0"
                      >
                        Required
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {mg.modifiers.length} option
                      {mg.modifiers.length !== 1 ? "s" : ""}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteGroup(mg.group.id)}
                      disabled={deleteGroupMutation.isPending}
                    >
                      <Trash2 className="size-3.5" />
                      <span className="sr-only">Delete group</span>
                    </Button>
                  </div>

                  {/* Expanded: group settings + modifiers */}
                  {isExpanded && (
                    <div className="border-t px-3 py-3 space-y-3">
                      {/* Required toggle */}
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`required-${mg.group.id}`}
                          checked={mg.group.isRequired}
                          onCheckedChange={(checked) =>
                            handleToggleRequired(mg.group.id, checked)
                          }
                          disabled={updateGroupMutation.isPending}
                          className="scale-90"
                        />
                        <Label
                          htmlFor={`required-${mg.group.id}`}
                          className="text-sm"
                        >
                          Required selection
                        </Label>
                      </div>

                      {/* Modifier list */}
                      {mg.modifiers.length > 0 ? (
                        <div className="space-y-1.5">
                          {mg.modifiers.map((m) => (
                            <div
                              key={m.id}
                              className="flex items-center gap-2 rounded bg-muted/50 px-2 py-1.5"
                            >
                              <span className="flex-1 text-sm">{m.name}</span>
                              {Number(m.price) > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  +₱{Number(m.price).toFixed(2)}
                                </span>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteModifier(m.id)}
                                disabled={deleteModifierMutation.isPending}
                              >
                                <Trash2 className="size-3" />
                                <span className="sr-only">Delete modifier</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          No options yet
                        </p>
                      )}

                      {/* Add modifier row */}
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Option name"
                          value={newModifierName}
                          onChange={(e) => setNewModifierName(e.target.value)}
                          onKeyDown={(e) =>
                            handleModifierKeyDown(e, mg.group.id)
                          }
                          className="flex-1 h-8 text-sm"
                        />
                        <Input
                          placeholder="+Price"
                          value={newModifierPrice}
                          onChange={(e) => setNewModifierPrice(e.target.value)}
                          onKeyDown={(e) =>
                            handleModifierKeyDown(e, mg.group.id)
                          }
                          className="w-20 h-8 text-sm"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-8 shrink-0"
                          onClick={() => handleAddModifier(mg.group.id)}
                          disabled={
                            createModifierMutation.isPending ||
                            !newModifierName.trim()
                          }
                        >
                          <Plus className="size-3.5" />
                          <span className="sr-only">Add modifier</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {modifierGroups.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4 border rounded-md border-dashed">
                No modifier groups yet. Add one below.
              </p>
            )}

            {/* Add new group */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="New group name (e.g. Choose your sauce)"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddGroup();
                  }
                }}
                className="flex-1"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleAddGroup}
                disabled={createGroupMutation.isPending || !newGroupName.trim()}
              >
                <Plus className="size-4" />
                <span className="sr-only">Add modifier group</span>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
