import {
  CheckCircle2,
  ClipboardCheck,
  Search,
  Settings2,
  ShoppingCart,
  Timer,
} from "lucide-react";
import type { InteractiveGuideSection } from "@/features/guides/components/interactive-guide-types";

export const ORDERING_GUIDE_SECTIONS: InteractiveGuideSection[] = [
  {
    id: "find-restaurant",
    stepNumber: 1,
    icon: Search,
    title: "Find the restaurant",
    paragraphs: [
      "Start by finding the restaurant where you are dining. You can search by name on the search page, browse featured restaurants on the home page, or scan the QR code on your table.",
      "If you scan a QR code, it takes you directly to the restaurant's menu with your table number pre-filled — skip ahead to step 2.",
    ],
  },
  {
    id: "browse-and-add",
    stepNumber: 2,
    icon: ShoppingCart,
    title: "Browse menu and add to cart",
    paragraphs: [
      "On the restaurant page, browse the menu by category using the tabs at the top. Each item shows its name, price, and photo. Tap an item to see full details.",
      "Use the quick add button to add simple items directly, or tap the item to open the detail sheet where you can select variants and modifiers before adding to cart.",
    ],
    subsections: [
      {
        id: "browse-and-add/select-variant",
        title: "Select a variant",
        paragraphs: [
          "Some items come in different variants — like sizes (Small, Medium, Large) or preparations (Fried, Grilled). Each variant can have a different price. Select one before adding to cart.",
        ],
      },
      {
        id: "browse-and-add/toggle-modifiers",
        title: "Toggle modifiers",
        paragraphs: [
          'Modifiers are optional extras like "Extra Rice", "No Onions", or "Add Egg". Toggle them on or off. Some modifiers have an additional cost shown next to the name.',
        ],
      },
    ],
  },
  {
    id: "customise-items",
    stepNumber: 3,
    icon: Settings2,
    title: "Customise items",
    paragraphs: [
      "The item detail sheet shows all customisation options. Select your preferred variant from the variant group, then toggle any modifiers you want. The price updates in real time as you make selections.",
      "Use the quantity picker to add more than one of the same item. When you are happy with the configuration, tap Add to Cart.",
    ],
    tip: {
      text: "You can add the same item multiple times with different customisations — each combination becomes a separate cart item.",
    },
  },
  {
    id: "review-cart",
    stepNumber: 4,
    icon: ClipboardCheck,
    title: "Review your cart",
    paragraphs: [
      "Tap the floating cart button at the bottom of the screen to open the cart drawer. Review your items — each shows the item name, selected variant, modifiers, quantity, and line total.",
      "Adjust quantities using the inline picker, or swipe to remove an item. The cart summary shows the subtotal and total at the bottom.",
    ],
    callout: {
      text: "Your cart is saved to your device. If you close the browser and come back, your items are still there as long as you return to the same restaurant.",
    },
  },
  {
    id: "checkout",
    stepNumber: 5,
    icon: CheckCircle2,
    title: "Confirm and submit order",
    paragraphs: [
      "Tap Checkout from the cart drawer to open the checkout sheet. Enter your table number — this tells the restaurant where to serve your order.",
      "Review the order summary one final time, then tap Submit Order. If you are not signed in, you will be prompted to log in or create an account first.",
    ],
    tip: {
      text: "Double-check your table number before submitting. The restaurant uses it to find you.",
    },
  },
  {
    id: "track-order",
    stepNumber: 6,
    icon: Timer,
    title: "Track your order",
    paragraphs: [
      "After submitting, you land on the order tracking page. The status timeline shows where your order is in the pipeline: Submitted → Accepted → Preparing → Ready → Completed.",
      "The page updates in real time. You can also find your order later from the Orders page in the bottom navigation.",
    ],
    accordionItems: [
      {
        trigger: "What if the restaurant rejects my order?",
        content:
          "You receive a notification that the order was rejected. This can happen if the restaurant is too busy or an item is unavailable. You can place a new order.",
      },
      {
        trigger: "Can I cancel an order after submitting?",
        content:
          "Order cancellation depends on the restaurant's policy. Contact the restaurant directly if you need to cancel after submission.",
      },
    ],
  },
];
