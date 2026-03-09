"use client";

import { MoreHorizontal, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { use, useState } from "react";
import { toast } from "sonner";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AddCategoryDialog } from "@/features/menu-management/components/add-category-dialog";
import { MenuItemManagementCard } from "@/features/menu-management/components/menu-item-card";
import {
  useDeleteCategory,
  useDeleteItem,
  useManagementMenu,
  useToggleAvailability,
} from "@/features/menu-management/hooks/use-management-menu";
import type { ManagementMenuItem } from "@/features/menu-management/types";

interface MenuManagementPageProps {
  params: Promise<{ restaurantId: string; branchId: string }>;
}

export default function MenuManagementPage({
  params,
}: MenuManagementPageProps) {
  const { branchId } = use(params);
  const { data: menu, isLoading } = useManagementMenu(branchId);
  const toggleMutation = useToggleAvailability(branchId);
  const deleteMutation = useDeleteItem(branchId);
  const deleteCategoryMutation = useDeleteCategory(branchId);

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<{
    id: string;
    name: string;
    itemCount: number;
  } | null>(null);

  // Derive active category — show all if none selected
  const categories = menu ?? [];
  const filteredCategories =
    activeCategoryId === null
      ? categories
      : categories.filter((c) => c.category.id === activeCategoryId);

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);

  // --- Handlers ---

  function handleToggleAvailability(id: string, isAvailable: boolean) {
    toggleMutation.mutate(
      { id, isAvailable },
      {
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this item?")) return;
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => toast.success("Item deleted"),
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleDeleteCategory() {
    if (!deleteCategoryTarget) return;
    deleteCategoryMutation.mutate(
      { id: deleteCategoryTarget.id },
      {
        onSuccess: () => {
          toast.success(`"${deleteCategoryTarget.name}" deleted`);
          if (activeCategoryId === deleteCategoryTarget.id) {
            setActiveCategoryId(null);
          }
          setDeleteCategoryTarget(null);
        },
        onError: (err) => {
          toast.error(err.message);
          setDeleteCategoryTarget(null);
        },
      },
    );
  }

  // Placeholder handlers for dialogs (wired in subsequent tasks)
  function handleEdit(_item: ManagementMenuItem) {
    toast.info("Edit dialog coming soon");
  }

  function handleManageVariants(_item: ManagementMenuItem) {
    toast.info("Variants dialog coming soon");
  }

  function handleManageModifiers(_item: ManagementMenuItem) {
    toast.info("Modifiers dialog coming soon");
  }

  return (
    <>
      <DashboardNavbar
        breadcrumbs={[
          { label: "Restaurants", href: "/organization/restaurants" },
          { label: "Menu" },
        ]}
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddCategoryOpen(true)}
            >
              <Plus className="mr-1.5 size-4" />
              Category
            </Button>
            <Button
              size="sm"
              onClick={() => toast.info("Add item dialog coming soon")}
            >
              <Plus className="mr-1.5 size-4" />
              Item
            </Button>
          </>
        }
      />

      <div className="flex-1 space-y-4 p-4 md:p-6">
        {/* Category filter tabs */}
        {isLoading ? (
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        ) : categories.length > 0 ? (
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              <Button
                variant={activeCategoryId === null ? "default" : "outline"}
                size="sm"
                className="rounded-full shrink-0"
                onClick={() => setActiveCategoryId(null)}
              >
                All
                <Badge variant="secondary" className="ml-1.5 px-1.5 py-0">
                  {totalItems}
                </Badge>
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.category.id}
                  variant={
                    activeCategoryId === cat.category.id ? "default" : "outline"
                  }
                  size="sm"
                  className="rounded-full shrink-0"
                  onClick={() => setActiveCategoryId(cat.category.id)}
                >
                  {cat.category.name}
                  <Badge variant="secondary" className="ml-1.5 px-1.5 py-0">
                    {cat.items.length}
                  </Badge>
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : null}

        {/* Menu items by category */}
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <UtensilsCrossed className="size-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">No menu items yet</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Start by adding a category, then add items to it. Your customers
              will see these on the public menu.
            </p>
            <Button className="mt-4" onClick={() => setAddCategoryOpen(true)}>
              <Plus className="mr-1.5 size-4" />
              Add First Category
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCategories.map((cat) => (
              <section key={cat.category.id}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold">
                    {cat.category.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {cat.items.length} item
                      {cat.items.length !== 1 ? "s" : ""}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Category actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() =>
                            setDeleteCategoryTarget({
                              id: cat.category.id,
                              name: cat.category.name,
                              itemCount: cat.items.length,
                            })
                          }
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete Category
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {cat.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg border-dashed">
                    No items in this category yet
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {cat.items.map((menuItemWithDetails) => (
                      <MenuItemManagementCard
                        key={menuItemWithDetails.item.id}
                        item={menuItemWithDetails}
                        onToggleAvailability={handleToggleAvailability}
                        onEdit={handleEdit}
                        onManageVariants={handleManageVariants}
                        onManageModifiers={handleManageModifiers}
                        onDelete={handleDelete}
                        isToggling={toggleMutation.isPending}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Add Category Dialog */}
      <AddCategoryDialog
        branchId={branchId}
        open={addCategoryOpen}
        onOpenChange={setAddCategoryOpen}
      />

      {/* Delete Category Confirmation */}
      <AlertDialog
        open={deleteCategoryTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteCategoryTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteCategoryTarget?.itemCount
                ? `"${deleteCategoryTarget.name}" has ${deleteCategoryTarget.itemCount} item${deleteCategoryTarget.itemCount !== 1 ? "s" : ""}. Deleting this category will also remove all its items.`
                : `Are you sure you want to delete "${deleteCategoryTarget?.name}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleteCategoryMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
