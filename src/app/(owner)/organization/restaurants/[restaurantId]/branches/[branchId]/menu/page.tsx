"use client";

import { MoreHorizontal, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { use, useState } from "react";
import { toast } from "sonner";
import { AppPageHeader } from "@/components/layout/app-page-header";
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
import { AppEmptyState } from "@/components/ui/app-empty-state";
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
import { AddItemDialog } from "@/features/menu-management/components/add-item-dialog";
import { EditItemDialog } from "@/features/menu-management/components/edit-item-dialog";
import { MenuItemManagementCard } from "@/features/menu-management/components/menu-item-card";
import { ModifierGroupDialog } from "@/features/menu-management/components/modifier-group-dialog";
import { VariantsDialog } from "@/features/menu-management/components/variants-dialog";
import {
  useDeleteCategory,
  useDeleteItem,
  useManagementMenu,
  useToggleAvailability,
} from "@/features/menu-management/hooks/use-management-menu";
import type { ManagementMenuItem } from "@/features/menu-management/types";
import { OwnerWalkthroughPanel } from "@/features/onboarding/components/owner-walkthrough-panel";

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
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ManagementMenuItem | null>(null);
  const [variantsTarget, setVariantsTarget] =
    useState<ManagementMenuItem | null>(null);
  const [modifiersTarget, setModifiersTarget] =
    useState<ManagementMenuItem | null>(null);
  const [deleteItemTarget, setDeleteItemTarget] =
    useState<ManagementMenuItem | null>(null);
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
    const target =
      categories
        .flatMap((category) => category.items)
        .find((item) => item.item.id === id) ?? null;
    setDeleteItemTarget(target);
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

  function handleEdit(item: ManagementMenuItem) {
    setEditTarget(item);
  }

  function handleManageVariants(target: ManagementMenuItem) {
    setVariantsTarget(target);
  }

  function handleManageModifiers(target: ManagementMenuItem) {
    setModifiersTarget(target);
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
            <Button size="sm" onClick={() => setAddItemOpen(true)}>
              <Plus className="mr-1.5 size-4" />
              Item
            </Button>
          </>
        }
      />

      <div className="flex-1 space-y-4 p-4 md:p-6">
        <AppPageHeader
          eyebrow="Branch operations"
          title="Menu"
          description="Build categories and keep items in sync with what you serve."
          variant="compact"
        />

        <OwnerWalkthroughPanel
          flowId="owner-branch-menu"
          title="Shape the live branch menu"
          description="Source of truth for what customers can order."
          steps={[
            {
              title: "Start with categories",
              description: "Define categories before adding items to them.",
            },
            {
              title: "Use availability instead of deleting when possible",
              description:
                "Toggle availability instead of deleting temporary stockouts.",
            },
            {
              title: "Review variants and modifiers before launch",
              description: "Verify add-ons and sizes before going live.",
            },
          ]}
        />

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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
          </div>
        ) : categories.length === 0 ? (
          <AppEmptyState
            icon={<UtensilsCrossed />}
            title="No menu items yet"
            description="Start by adding a category, then add items to it. Customers will only see what you publish here."
            primaryAction={
              <Button shape="pill" onClick={() => setAddCategoryOpen(true)}>
                <Plus className="mr-1.5 size-4" />
                Add first category
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
            {filteredCategories.map((cat) => (
              <section key={cat.category.id}>
                <div className="flex items-center justify-between mb-4">
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
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Add Item Dialog */}
      <AddItemDialog
        branchId={branchId}
        categories={categories}
        defaultCategoryId={activeCategoryId ?? undefined}
        open={addItemOpen}
        onOpenChange={setAddItemOpen}
      />

      {/* Edit Item Dialog */}
      <EditItemDialog
        branchId={branchId}
        item={editTarget}
        open={editTarget !== null}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      />

      {/* Variants Dialog */}
      <VariantsDialog
        branchId={branchId}
        item={variantsTarget}
        open={variantsTarget !== null}
        onOpenChange={(open) => {
          if (!open) setVariantsTarget(null);
        }}
      />

      {/* Modifier Groups Dialog */}
      <ModifierGroupDialog
        branchId={branchId}
        item={modifiersTarget}
        open={modifiersTarget !== null}
        onOpenChange={(open) => {
          if (!open) setModifiersTarget(null);
        }}
      />

      {/* Delete Category Confirmation */}
      <AlertDialog
        open={deleteItemTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteItemTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete menu item?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteItemTarget
                ? `Delete "${deleteItemTarget.item.name}" from this branch menu? This cannot be undone.`
                : "Delete this menu item?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteItemTarget) return;
                deleteMutation.mutate(
                  { id: deleteItemTarget.item.id },
                  {
                    onSuccess: () => {
                      toast.success("Item deleted");
                      setDeleteItemTarget(null);
                    },
                    onError: (err) => {
                      toast.error(err.message);
                      setDeleteItemTarget(null);
                    },
                  },
                );
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
