# Legacy Product Inventory

> What the legacy CravingsPH product actually delivers to users.

## Target User

**Dine-in or takeout customers** at Philippine restaurants. They arrive at the menu via a direct link or QR code at the restaurant.

## What a Customer Can Do

### Browse a Restaurant Menu
- Land on a restaurant branch page via unique URL (e.g. `/restaurant/jollibee-makati`)
- See the restaurant's name, cover photo, profile picture
- Browse menu items organized by categories (e.g. "Chicken", "Drinks", "Desserts")
- Scroll through categories or jump to a category via sticky navigation
- Search menu items by name
- View item details: name, description, image, price

### Customize an Item
- Open an item to see available customizations (e.g. "Size", "Add-ons", "Spice Level")
- Some customizations are required before adding to cart (e.g. must pick a size)
- Some allow multiple selections (e.g. pick up to 3 toppings)
- Customizations can have additional costs (e.g. extra cheese +₱25)
- Select quantity before adding to cart

### Manage a Cart
- Add items to a running cart
- Identical items (same customizations) automatically merge and increase quantity
- View cart summary with itemized breakdown
- Update quantities or remove items
- See running total including all customization costs
- Cart persists across page refreshes (saved locally on device)

### View Restaurant Info
- Copy the restaurant's phone number to clipboard
- Open the restaurant's Google Maps location

## What a Customer Cannot Do

- Create an account or log in
- Place an order
- Pay for anything
- Track an order
- View past orders
- Rate or review a restaurant
- Discover restaurants (must have direct link)
- Use the product on desktop (shows "Coming Soon" message)

## What a Restaurant Owner Cannot Do

- Register or manage their restaurant
- Edit their menu, prices, or images
- View or manage orders
- See any analytics or reports
- Manage multiple branches

## Business Model Observations

- **No revenue path exists** — no ordering, no payments, no subscriptions
- **No user accounts** — zero customer retention mechanism
- **No restaurant self-service** — all data must be manually entered into the database
- **Mobile-only** — desktop visitors see a dead end
- **Single-restaurant assumption** — the product doesn't support discovery or multi-restaurant browsing
- **QR code / direct link distribution** — works for dine-in, but no organic discovery

## What Works Well (Worth Keeping)

1. **Clean mobile menu UX** — category navigation, search, item sheets feel polished
2. **Modifier system** — required/optional customizations with min/max rules and pricing is well-modeled
3. **Cart with smart merging** — identical items merge automatically, good UX
4. **Persistent cart** — survives page refresh, customers don't lose their selections
5. **Branch-based URLs** — each branch has its own page, supports multi-location restaurants
6. **Philippine-localized** — peso pricing, Philippine address structure (province, city, barangay)
