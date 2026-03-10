# Database Schema Gap Analysis

## Existing Tables (10)
profile, user_roles, organization, restaurant, branch, category, menu_item, item_variant, modifier_group, modifier

## Schema Patterns
- UUID PKs with `gen_random_uuid()`
- `created_at` / `updated_at` timestamps with TZ
- Cascade deletes on all FKs
- FK columns indexed
- Slug columns indexed + unique
- Composite indexes for sort/filter
- Drizzle ORM with `drizzle-zod` for type generation
- Central export from `src/shared/infra/db/schema/index.ts`

## Existing Relevant Columns
- `restaurant.is_featured` (boolean, default false) — already exists for featured curation
- `restaurant.verification_status` (varchar 20, default 'pending')
- `branch.city`, `branch.province` — exist for location filtering
- `branch.is_ordering_enabled`, `branch.auto_accept_orders`, `branch.payment_countdown_minutes` — order settings exist

## New Tables Needed

### 1. profile.portal_preference (column addition)
- Add `portal_preference varchar(20)` to profile table
- Values: 'customer' | 'owner'
- Nullable, default null (legacy accounts)

### 2. saved_restaurant
- id, user_id (FK auth.users), restaurant_id (FK restaurant), saved_at, note
- UNIQUE(user_id, restaurant_id)

### 3. order
- id, order_number (unique), branch_id (FK branch), customer_id (FK auth.users nullable)
- order_type ('dine-in' | 'pickup'), customer_name, customer_phone, table_number
- total_amount (numeric 10,2), status, payment_status, payment_method
- payment_reference, payment_screenshot_url, special_instructions
- created_at, updated_at

### 4. order_item
- id, order_id (FK order), menu_item_id (FK menu_item nullable), item_variant_id (FK nullable)
- name, quantity, unit_price (numeric 10,2), modifiers (jsonb)
- created_at, updated_at

### 5. order_status_history
- id, order_id (FK order cascade), from_status, to_status, changed_by (FK auth.users nullable)
- note, created_at

### 6. review
- id, order_id (FK order), restaurant_id (FK restaurant), user_id (FK auth.users)
- author_name, rating (integer 1-5), comment, created_at, updated_at

### 7. payment_method
- id, organization_id (FK organization cascade)
- type ('gcash' | 'maya' | 'bank'), account_name, account_number, bank_name
- is_default, is_active, created_at, updated_at

### 8. verification_document
- id, restaurant_id (FK restaurant cascade)
- document_type ('business_registration' | 'valid_government_id' | 'business_permit')
- file_name, file_url, uploaded_at, status ('pending' | 'verified' | 'rejected')
- rejection_reason, created_at, updated_at

### 9. operating_hours
- id, branch_id (FK branch cascade), day_of_week (integer 0-6)
- opens_at (time), closes_at (time), is_closed (boolean)
- UNIQUE(branch_id, day_of_week)

### 10. branch lat/lng (column additions)
- Add `latitude numeric(10,7)` and `longitude numeric(10,7)` to branch table
