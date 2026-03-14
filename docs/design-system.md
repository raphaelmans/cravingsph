# CravingsPH Design System

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Brand Colors](#2-brand-colors)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Motion & Interactions](#5-motion--interactions)
6. [Design Tokens](#6-design-tokens)
7. [Component Guidelines](#7-component-guidelines)
8. [Admin Dashboard Design](#8-admin-dashboard-design)
9. [Summary](#9-summary)

---

## 1. Design Philosophy

### Aesthetic

CravingsPH follows a clean, minimal, and modern aesthetic inspired by Apple-style product design. The interface prioritizes clarity over decoration, allowing content — especially food items and restaurant information — to take center stage.

Generous white space is used to reduce cognitive load and guide users naturally through the interface. Visual elements should feel light, calm, and refined. Avoid unnecessary visual noise, heavy shadows, or overly complex decorations.

### Design Principles

- **User-Centric** — Design decisions should prioritize what helps users quickly find food that satisfies their cravings. Interfaces should reduce friction and make discovery effortless.
- **Mobile-First** — Most users will discover restaurants on mobile devices. Layouts, components, and interactions should be designed for small screens first, then expanded for larger screens.
- **Quick Scan** — Users should be able to understand key information instantly. Menus, restaurant cards, and search results must prioritize scannability through clear hierarchy, strong typography, and consistent spacing.
- **One System Across All Portals** — Customer, owner, admin, and guide experiences share the same typography, radius scale, card hierarchy, empty-state behavior, and motion rules. Navigation shells may differ, but the visual language does not.

---

## 2. Brand Colors

### Primary Color — Cravings Orange

- **Hex:** `#F86006`
- **Usage:** Primary buttons, active states, key highlights, important call-to-action elements
- This color represents appetite, energy, and warmth. It should be used strategically to guide user attention.

### Primary Text — Dark Text

- **Hex:** `#1D1D1D`
- **Usage:** Headlines, body text, navigation
- This near-black provides strong readability while maintaining a softer tone than pure black.

### Neutral Colors

Recommended neutrals to support the minimal aesthetic:

| Purpose | Hex |
|---|---|
| Background | `#FFFFFF` |
| Light Gray Background | `#F7F7F7` |
| Divider | `#EAEAEA` |
| Secondary Text | `#6B6B6B` |

Neutrals should dominate the interface so the primary color remains visually impactful.

---

## 3. Typography

### Headlines

- **Font:** Plus Jakarta Sans
- **Usage:** Page titles, restaurant names, section headings
- **Characteristics:** Modern, friendly yet professional, strong readability on mobile

**Suggested scale:**

| Level | Size | Weight |
|---|---|---|
| H1 | 32px | SemiBold |
| H2 | 24px | SemiBold |
| H3 | 20px | Medium |

### Body Text

- **Font:** Inter
- **Usage:** Descriptions, menu item details, UI labels, metadata

**Suggested scale:**

| Level | Size |
|---|---|
| Body Large | 16px |
| Body | 14px |
| Caption | 12px |

Line height should be generous (1.5-1.6) to improve readability.

---

## 4. Spacing & Layout

CravingsPH follows a spacing system based on an **8px grid**.

### Spacing Scale

| Size | Usage |
|---|---|
| 4px | Micro spacing |
| 8px | Tight spacing |
| 16px | Standard spacing |
| 24px | Section spacing |
| 32px | Large spacing |
| 48px | Major sections |
| 64px | Page separation |

### Layout Principles

- **Generous White Space** — Whitespace is intentional and helps highlight menu items, food images, and restaurant information.
- **Card-Based Layout** — Restaurants and menu items should appear in cards to create clear visual grouping.
- **Consistent Padding:**
  - Cards: 16-20px padding
  - Page margins (mobile): 16px
  - Page margins (desktop): 24-32px
- **Content Width** — Maximum content width on desktop: **1200px**. This keeps the interface comfortable to read while maintaining focus.

---

## 5. Motion & Interactions

Motion should be subtle, purposeful, and responsive. Animations must reinforce usability rather than distract from it.

### Animation Principles

- **Fast** — Animations should complete within **150-250ms**.
- **Smooth** — Use ease-out curves for most interactions.
- **Purposeful** — Motion should communicate state changes such as hover, selection, or loading.

### Interaction Examples

**Buttons:**
- Slight scale (1.02-1.04) on hover
- Quick press animation on click

**Cards:**
- Gentle elevation or shadow increase on hover
- Click feedback through subtle scale

**Page Transitions:**
- Soft fade or slight upward motion (8-12px)

**Loading States:**
- Skeleton loaders for menus and restaurant lists

### Microinteractions

Small feedback signals help users feel confident in their actions:
- Button hover states
- Favoriting a restaurant
- Adding items to a saved list

Microinteractions should feel lightweight and responsive.

---

## 6. Design Tokens

Design tokens ensure visual consistency across the product and make it easier for developers to implement the design system.

### Color Tokens

The system follows **shadcn/ui style semantic tokens** so components remain themeable and consistent across light and dark modes.

| Token | Purpose |
|---|---|
| `--background` | App background |
| `--foreground` | Primary text |
| `--card` | Card background |
| `--card-foreground` | Text inside cards |
| `--popover` | Popover background |
| `--popover-foreground` | Popover text |
| `--primary` | Brand primary color |
| `--primary-foreground` | Text on primary elements |
| `--secondary` | Secondary UI surfaces |
| `--secondary-foreground` | Text on secondary surfaces |
| `--muted` | Muted surfaces |
| `--muted-foreground` | Muted text |
| `--accent` | Accent highlights |
| `--accent-foreground` | Text on accent surfaces |
| `--border` | Borders and dividers |
| `--input` | Input borders |
| `--ring` | Focus rings |

### Implementation (Light Mode)

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.18 0.02 260);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.18 0.02 260);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.18 0.02 260);
  --primary: oklch(0.66 0.23 40); /* Cravings Orange */
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.97 0.01 260);
  --secondary-foreground: oklch(0.18 0.02 260);
  --muted: oklch(0.96 0.01 260);
  --muted-foreground: oklch(0.45 0.02 260);
  --accent: oklch(0.66 0.23 40);
  --accent-foreground: oklch(1 0 0);
  --border: oklch(0.92 0.01 260);
  --input: oklch(0.92 0.01 260);
  --ring: oklch(0.66 0.23 40);
}
```

---

## 7. Component Guidelines

Components should follow consistent spacing, typography, and interaction patterns.

### Buttons

**Primary Button:**
- Usage: Main actions — "View Menu", "Add Restaurant", "Search"
- Style: Background `color-primary`, text white, padding 12px 16px, radius `radius-md`
- Interaction: Hover — slight brightness increase. Active — scale 0.98.

**Secondary Button:**
- Usage: Less prominent actions
- Style: Background transparent, border `color-primary`, text `color-text-primary`

### Restaurant Card

Restaurant cards are the primary discovery component on CravingsPH.

**Structure:**
- Restaurant image
- Restaurant name
- Cuisine / tags
- Location

**Guidelines:**
- Image aspect ratio: 4:3
- Padding: 16px
- Radius: `radius-lg`
- Shadow: `shadow-sm`
- Interaction: Hover — elevate to `shadow-md`. Click — slight scale feedback.
- Cards must remain **clean and scannable**.

### Menu Item Card

Menu items display individual food offerings.

**Structure:**
- Food image
- Item name
- Short description
- Price

**Guidelines:**
- Image aspect ratio: 1:1
- Description limited to 2 lines
- Price should be visually emphasized
- Spacing: 12-16px between elements

### Input Fields

Used for search, filters, and admin dashboards.

- Border: `color-border`
- Padding: 12px
- Radius: `radius-md`
- Focus state: Border color `color-primary`, optional subtle shadow
- Search inputs should be visually prominent because **search is a core interaction** of the platform.

### Tags / Cuisine Chips

Used for cuisine categories and filters.

- Background: `color-background-muted`
- Padding: 6px 10px
- Radius: `radius-xl`
- Examples: "Cafe", "Croissants", "Japanese"
- Tags should remain small and unobtrusive.

---

## 8. Admin Dashboard Design

The CravingsPH admin interface is designed for restaurant owners and staff who manage their restaurants, branches, payment methods, menus, items, categories, and add-ons.

Unlike the consumer interface, which focuses on discovery, the admin interface focuses on **speed of editing**, **clarity of structure**, and **real-time preview** of menu content.

The admin experience should feel similar to modern productivity tools (Notion, Linear, Stripe dashboards): clean, structured, and efficient.

### Admin Design Philosophy

- **Edit While Seeing the Result** — Whenever possible, admins should see a live preview of the menu item while editing. This helps them understand exactly how the item will appear to customers.
- **Structured Content Editing** — Menu data should be organized into clear hierarchical structures: Restaurant > Categories > Items > Modifiers / Add-ons. Interfaces should reflect this structure visually so users understand where they are editing within the menu system.
- **Minimal Cognitive Load** — Restaurant owners are not technical users. The UI should prioritize simplicity, clear labels, and familiar patterns. Avoid exposing unnecessary configuration or technical language.
- **Immediate Feedback** — Actions such as adding options, deleting modifiers, or updating prices should feel immediate and responsive.

### Admin Interaction Model

The admin dashboard should support the management of the following core entities:
- Restaurants
- Branches
- Payment Methods
- Categories
- Menu Items
- Modifier Groups / Add-ons

The admin dashboard should support three main workflows:
- **Create** — Add new restaurants, branches, items, categories, or configuration
- **Edit** — Modify existing content such as prices, descriptions, options, or settings
- **Organize** — Arrange categories, options, and modifiers

The interface should prioritize **editing directly within context** rather than navigating across many pages. Example patterns:
- Inline editing
- Expandable sections
- Drag-and-drop ordering
- Immediate previews

### Modifier & Add-on Editing

Menu customization is a core feature of restaurant menus. Modifier groups allow customers to customize items (size, sides, toppings, etc.).

**Structure:**
- Modifier Group
  - Group name (e.g., Size, Sides)
  - Selection rules (Min / Max)
  - Required indicator
  - Options within group
    - Option name
    - Price adjustment

**Interaction guidelines:**
- Groups should be collapsible
- Options should be editable inline
- Drag handles allow reordering
- "Add Option" button adds new entries quickly

**Example patterns:**
- Radio selection — single choice (Size)
- Checkbox selection — multiple choices (Sides)

### Inline Editing

Admin users should be able to edit values directly in place.

Examples:
- Click price — edit value
- Click option name — rename
- Click category — select from dropdown

Inline editing reduces navigation and speeds up content updates.

### Visual Preview

The preview panel should display the menu item as customers will see it.

Preview includes:
- Image
- Item name
- Description
- Price
- Modifier groups
- Options

This preview helps admins ensure the menu appears correct without leaving the editing screen.

### Admin Interaction Principles

- **Direct Manipulation** — Users interact directly with menu elements (dragging, editing, toggling).
- **Low Friction Editing** — Common actions should take one or two clicks maximum.
- **Consistent Interaction Patterns** — Adding items, categories, and options should follow the same interaction logic across the interface.
- **Safe Destructive Actions** — Deleting items or options should require confirmation or allow undo.
- **Visual Hierarchy** — Admin pages should emphasize hierarchy clearly: page title, primary actions (Submit, Save), core content fields, advanced configuration. The goal is to make the interface scannable and predictable even when many configuration options exist.

---

## 9. Summary

The CravingsPH design system prioritizes:

- **Clarity**
- **Speed**
- **Scannability**
- **Mobile usability**

By maintaining a minimal aesthetic, strong typography, and consistent spacing, the platform ensures that users can quickly discover restaurants and explore menus without friction.
