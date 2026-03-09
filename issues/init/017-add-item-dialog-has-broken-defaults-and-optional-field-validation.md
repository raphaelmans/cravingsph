# Add item dialog has broken defaults and optional field validation

Severity: high

## Summary

The owner `Add Item` dialog does not provide a valid happy path out of the box. The category is not preselected even when only one category exists, and the optional image URL field still triggers URL validation when left empty.

## Why this matters

- Blocks owners from quickly creating the first menu item.
- Prevents the team from reaching downstream customer menu/cart/checkout flows reliably.
- Conflicts with the onboarding guidance that owners can build the menu after setup.

## Expected

- When there is an active or only category, the dialog should preselect it.
- Optional `Image URL` should be allowed to stay empty without validation failure.

## Actual

- Opening `Add Item` after creating the first category still showed `Select a category`.
- Leaving image URL blank produced `Invalid URL`.
- The category field also surfaced `Invalid UUID` until a selection was made.

## Browser evidence

- Verified with `playwright-cli` on the branch menu route.
- After creating the first category (`Meals`), the add-item dialog still failed validation until category was manually selected and an image URL was provided.

## Code evidence

- Default category is `defaultCategoryId ?? ""`, but no category is supplied from the menu page, so `categoryId` starts invalid: [src/features/menu-management/components/add-item-dialog.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/features/menu-management/components/add-item-dialog.tsx#L30)
- The dialog passes `imageUrl: ""` into the form even though the field is described as optional: [src/features/menu-management/components/add-item-dialog.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/features/menu-management/components/add-item-dialog.tsx#L46)

## Repro

1. Open branch menu management.
2. Create the first category.
3. Click `Item`.
4. Fill name and base price only.
5. Observe validation errors for category and image URL.

## Recommended fix

- Preselect the active category or the sole category when opening the dialog.
- Normalize empty `imageUrl` to `undefined` before validation, or update the schema to accept empty strings for optional fields.
