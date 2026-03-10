"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, X } from "lucide-react";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  type CreateMenuItemDTO,
  CreateMenuItemSchema,
} from "@/modules/menu/dtos/menu.dto";
import { getSupabaseBrowserClient } from "@/shared/infra/supabase/browser-client";
import { useCreateItem } from "../hooks/use-management-menu";
import type { ManagementCategory } from "../types";

interface AddItemDialogProps {
  branchId: string;
  categories: ManagementCategory[];
  defaultCategoryId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddItemDialog({
  branchId,
  categories,
  defaultCategoryId,
  open,
  onOpenChange,
}: AddItemDialogProps) {
  const createMutation = useCreateItem(branchId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Resolve the initial category: explicit default > sole category > empty
  const resolvedCategoryId =
    defaultCategoryId ??
    (categories.length === 1 ? categories[0].category.id : "");

  const form = useForm<CreateMenuItemDTO>({
    resolver: zodResolver(CreateMenuItemSchema),
    defaultValues: {
      categoryId: resolvedCategoryId,
      name: "",
      description: "",
      basePrice: "",
      imageUrl: "",
    },
  });

  async function handleImageUpload(file: File) {
    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      toast.error("Image must be under 5 MB");
      return;
    }

    setUploading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${branchId}/${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage
        .from("menu-item-images")
        .upload(path, file, { upsert: true });

      if (error) {
        toast.error(`Upload failed: ${error.message}`);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("menu-item-images").getPublicUrl(path);

      form.setValue("imageUrl", publicUrl);
      setPreviewUrl(publicUrl);
    } finally {
      setUploading(false);
    }
  }

  function clearImage() {
    form.setValue("imageUrl", "");
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function onSubmit(data: CreateMenuItemDTO) {
    // Strip empty optional fields
    const payload: CreateMenuItemDTO = {
      ...data,
      description: data.description || undefined,
      imageUrl: data.imageUrl || undefined,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Item created");
        form.reset({
          categoryId: resolvedCategoryId,
          name: "",
          description: "",
          basePrice: "",
          imageUrl: "",
        });
        setPreviewUrl(null);
        onOpenChange(false);
      },
      onError: (err) => toast.error(err.message),
    });
  }

  // Reset categoryId when dialog opens
  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      const categoryToSet =
        defaultCategoryId ??
        (categories.length === 1 ? categories[0].category.id : "");
      if (categoryToSet) {
        form.setValue("categoryId", categoryToSet);
      }
    }
    if (!nextOpen) {
      setPreviewUrl(null);
    }
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Item</DialogTitle>
          <DialogDescription>
            Add a new menu item to a category.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem
                          key={cat.category.id}
                          value={cat.category.id}
                        >
                          {cat.category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Iced Coffee, Chicken Adobo"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the item"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Price</FormLabel>
                  <FormControl>
                    <Input placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image upload */}
            <FormItem>
              <FormLabel>Image (optional)</FormLabel>
              <div className="flex items-center gap-4">
                {previewUrl ? (
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={previewUrl}
                      alt="Item preview"
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-white shadow"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex size-20 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:bg-muted disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 className="size-6 animate-spin" />
                    ) : (
                      <ImagePlus className="size-6" />
                    )}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, or WebP. Max 5 MB.
                </p>
              </div>
            </FormItem>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || uploading}
              >
                {createMutation.isPending ? "Creating..." : "Add Item"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
