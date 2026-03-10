"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, X } from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseBrowserClient } from "@/shared/infra/supabase/browser-client";
import { useUpdateItem } from "../hooks/use-management-menu";
import type { ManagementMenuItem } from "../types";

/** Form schema for the edit dialog (id omitted from form, injected on submit). */
const EditItemFormSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  basePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  imageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});
type EditItemFormValues = z.infer<typeof EditItemFormSchema>;

interface EditItemDialogProps {
  branchId: string;
  item: ManagementMenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditItemDialog({
  branchId,
  item,
  open,
  onOpenChange,
}: EditItemDialogProps) {
  const updateMutation = useUpdateItem(branchId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<EditItemFormValues>({
    resolver: zodResolver(EditItemFormSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: "",
      imageUrl: "",
    },
  });

  // Reset form values when item changes
  useEffect(() => {
    if (item) {
      form.reset({
        name: item.item.name,
        description: item.item.description ?? "",
        basePrice: item.item.basePrice,
        imageUrl: item.item.imageUrl ?? "",
      });
      setPreviewUrl(item.item.imageUrl ?? null);
    }
  }, [item, form]);

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

  function onSubmit(data: EditItemFormValues) {
    if (!item) return;

    updateMutation.mutate(
      {
        id: item.item.id,
        name: data.name,
        description: data.description || undefined,
        basePrice: data.basePrice,
        imageUrl: data.imageUrl || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Item updated");
          onOpenChange(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Update the details for &ldquo;{item?.item.name}&rdquo;.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input autoFocus {...field} />
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
              <div className="flex items-center gap-3">
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
                disabled={updateMutation.isPending || uploading}
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
