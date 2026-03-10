"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  useCreateVariant,
  useDeleteVariant,
} from "../hooks/use-management-menu";
import type { ManagementMenuItem } from "../types";

interface VariantsDialogProps {
  branchId: string;
  item: ManagementMenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VariantsDialog({
  branchId,
  item,
  open,
  onOpenChange,
}: VariantsDialogProps) {
  const createMutation = useCreateVariant(branchId);
  const deleteMutation = useDeleteVariant(branchId);

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  function handleAdd() {
    if (!item || !newName.trim() || !newPrice.trim()) return;

    createMutation.mutate(
      {
        menuItemId: item.item.id,
        name: newName.trim(),
        price: newPrice.trim(),
      },
      {
        onSuccess: () => {
          setNewName("");
          setNewPrice("");
          toast.success("Variant added");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleDelete(variantId: string) {
    deleteMutation.mutate(
      { id: variantId },
      {
        onSuccess: () => toast.success("Variant removed"),
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  const variants = item?.variants ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Variants</DialogTitle>
          <DialogDescription>
            {item
              ? `Size or type variants for "${item.item.name}". Each variant has its own price.`
              : "Select an item to manage variants."}
          </DialogDescription>
        </DialogHeader>

        {item && (
          <div className="space-y-4">
            {/* Existing variants */}
            {variants.length > 0 && (
              <div className="space-y-2">
                {variants.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center gap-2 rounded-md border px-4 py-2"
                  >
                    <span className="flex-1 text-sm font-medium">{v.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ₱{Number(v.price).toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(v.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="size-3.5" />
                      <span className="sr-only">Delete variant</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {variants.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4 border rounded-md border-dashed">
                No variants yet. Add sizes or types below.
              </p>
            )}

            {/* Add new variant row */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Name (e.g. Large)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Input
                placeholder="Price"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-24"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleAdd}
                disabled={
                  createMutation.isPending ||
                  !newName.trim() ||
                  !newPrice.trim()
                }
              >
                <Plus className="size-4" />
                <span className="sr-only">Add variant</span>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
