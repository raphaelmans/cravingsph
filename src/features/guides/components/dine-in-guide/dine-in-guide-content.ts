import {
  CheckCircle2,
  ClipboardCheck,
  LogOut,
  QrCode,
  Settings2,
  ShoppingCart,
  Timer,
  Utensils,
} from "lucide-react";
import type { InteractiveGuideSection } from "@/features/guides/components/interactive-guide-types";

export const DINE_IN_GUIDE_SECTIONS: InteractiveGuideSection[] = [
  {
    id: "scan-qr",
    stepNumber: 1,
    icon: QrCode,
    title: "Scan the QR code at your table",
    paragraphs: [
      "Every table at a participating restaurant has a printed QR code. Open the CravingsPH app or tap the Scan button in the bottom navigation bar to launch the scanner, then point your phone's camera at the code.",
      "The QR code encodes the branch and the specific table you are sitting at. When you scan it, the system opens a table session — a live record that links your visit to that physical table. You land directly on the restaurant's menu with your table already identified.",
    ],
    tip: {
      text: "If the camera does not focus on the QR code, move your phone a little further away or tap the screen to refocus. Most phones need at least 15 cm of distance to read the code.",
    },
    callout: {
      text: "You do not need to type a table number. The QR code handles it automatically. If you cannot scan, you can still find the restaurant through search and enter your table number manually at checkout.",
    },
  },
  {
    id: "table-session",
    stepNumber: 2,
    icon: Utensils,
    title: "Your table session is now active",
    paragraphs: [
      'After scanning, a table session banner appears at the top of the menu page. It shows the table label (e.g., "Table 5") and a session indicator confirming you are connected to that table.',
      "The session stays active for the entire duration of your visit. You can place multiple orders during a single session — a round of drinks first, then starters, then mains — and each order is linked to the same table. The restaurant's kitchen sees all orders from your table grouped together.",
    ],
    accordionItems: [
      {
        trigger: "What if someone else scans the same table?",
        content:
          "Multiple guests at the same table can each scan the code. Their orders will be linked to the same table session, making it easy for the restaurant to serve the right table regardless of who placed each order.",
      },
      {
        trigger: "What if I accidentally scan the wrong table?",
        content:
          "You can close the session from the session banner and scan the correct table's QR code to open a new session. Only submit your order once you have confirmed the correct table.",
      },
    ],
  },
  {
    id: "browse-menu",
    stepNumber: 3,
    icon: ShoppingCart,
    title: "Browse the menu",
    paragraphs: [
      "The menu is organised into categories — tabs at the top let you jump between sections like Starters, Mains, Desserts, and Drinks. Each item shows its name, description, base price, and photo.",
      "Tap the quick-add button on simple items to add them to your cart instantly, or tap the item card to open the detail sheet for customisation.",
    ],
  },
  {
    id: "customise-order",
    stepNumber: 4,
    icon: Settings2,
    title: "Customise with modifiers and variants",
    paragraphs: [
      "The item detail sheet shows all available customisation options. Some items have variants (like sizes or preparations) and modifier groups (like add-ons or choices).",
      "Modifiers come in two types: required and optional. Required modifiers — like choosing your steak temperature — must be selected before you can add the item to your cart. Optional modifiers — like an extra sauce or a wine pairing — can be toggled on or skipped entirely.",
    ],
    subsections: [
      {
        id: "customise-order/required-modifiers",
        title: "Required modifiers",
        paragraphs: [
          "A required modifier group forces you to make a selection. For example, a steak might require you to choose a temperature: Rare, Medium Rare, Medium, or Well Done. The Add to Cart button stays disabled until all required selections are made.",
          'Required groups show a "Required" label and indicate how many selections you need — usually one. This ensures the kitchen always knows how to prepare your item.',
        ],
      },
      {
        id: "customise-order/optional-modifiers",
        title: "Optional modifiers",
        paragraphs: [
          "Optional modifier groups let you add extras without obligation. A sauce selection might be optional — pick one if you want, or skip it. Some optional groups allow multiple selections with a maximum limit.",
          "Modifiers with an additional cost show the price next to the name. The item total updates in real time as you toggle modifiers on and off.",
        ],
      },
      {
        id: "customise-order/variants",
        title: "Selecting a variant",
        paragraphs: [
          "Variants represent different versions of the same item — an espresso vs. a café crème, a regular juice vs. a large. Each variant has its own price. Select one before adding to cart.",
        ],
      },
    ],
    tip: {
      text: "You can add the same item multiple times with different customisations. Order one steak medium rare with béarnaise and another well done with au poivre — each becomes a separate cart line.",
    },
  },
  {
    id: "review-cart",
    stepNumber: 5,
    icon: ClipboardCheck,
    title: "Review your cart",
    paragraphs: [
      "Tap the floating cart button at the bottom of the screen to open the cart drawer. Each line item shows the item name, selected variant, active modifiers, quantity, and line total.",
      "Your table information is shown at the top of the cart as a reminder — the table label from your scanned QR code. Adjust quantities with the inline picker or swipe to remove an item. The subtotal and total update automatically.",
    ],
    callout: {
      text: "Your cart is saved to your device. If you close the browser and return to the same restaurant, your items will still be there — and your table session remains active.",
    },
  },
  {
    id: "submit-order",
    stepNumber: 6,
    icon: CheckCircle2,
    title: "Submit your order",
    paragraphs: [
      "Tap Checkout from the cart drawer to open the checkout sheet. Because you scanned a QR code, your table number is already filled in — no manual entry required.",
      "Review the order summary one final time: items, quantities, modifiers, and total. Add any special instructions for the kitchen in the notes field if needed. Then tap Submit Order.",
      "If you are not signed in, you will be prompted to log in or create an account before the order goes through. This lets the restaurant associate the order with your profile.",
    ],
    tip: {
      text: "After submitting, your cart clears but your table session stays active. You can browse the menu and place another order — perfect for ordering drinks after your main course.",
    },
  },
  {
    id: "track-order",
    stepNumber: 7,
    icon: Timer,
    title: "Track your order in real time",
    paragraphs: [
      "After submitting, you land on the order tracking page. The status timeline updates in real time as the restaurant processes your order: Submitted → Accepted → Preparing → Ready → Completed.",
      "You can also find all your orders from the Orders page in the bottom navigation. If you placed multiple orders during your table session, each one appears as a separate entry with its own status.",
    ],
    accordionItems: [
      {
        trigger: "What if the restaurant rejects my order?",
        content:
          "You receive a notification that the order was rejected. This can happen if the restaurant is too busy or an item is unavailable. You can modify your order and resubmit from the same table session.",
      },
      {
        trigger: "Can I cancel an order after submitting?",
        content:
          "Order cancellation depends on the restaurant's policy. Contact the restaurant directly if you need to cancel after submission.",
      },
      {
        trigger: "When does my table session close?",
        content:
          "Your table session stays active until the restaurant closes it out — typically after you have paid and left. You do not need to do anything to end the session yourself.",
      },
    ],
  },
  {
    id: "end-session",
    stepNumber: 8,
    icon: LogOut,
    title: "End your visit",
    isOptional: true,
    paragraphs: [
      "When you are finished dining, the restaurant staff closes your table session. This marks the table as available for the next guest. All orders from your visit remain in your order history.",
      "You do not need to take any action to end the session — the restaurant handles it. If you want, you can close the session yourself from the session banner at the top of the menu page.",
    ],
  },
];
