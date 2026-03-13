import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Inbox,
  Settings,
  XCircle,
} from "lucide-react";
import type { InteractiveGuideSection } from "@/features/guides/components/interactive-guide-types";

export const OWNER_OPS_GUIDE_SECTIONS: InteractiveGuideSection[] = [
  {
    id: "view-order-queue",
    stepNumber: 1,
    icon: Inbox,
    title: "View incoming orders",
    paragraphs: [
      "The order queue is your command centre. It is organised into tabs: Inbox for new orders waiting for action, Accepted for orders you have confirmed, and Completed for finished orders.",
      "Each order card shows the order number, table number, item count, and time since submission. Tap an order to see the full detail view with all items, customisations, and customer information.",
    ],
    tip: {
      text: "Check the Inbox tab regularly. Responding quickly to new orders keeps customers happy and reduces wait times.",
    },
  },
  {
    id: "accept-reject",
    stepNumber: 2,
    icon: CheckCircle2,
    title: "Accept or reject an order",
    paragraphs: [
      "When you open a new order, review the items and table number. If everything looks good, tap Accept to confirm the order. The customer sees their status update to Accepted immediately.",
      "If you cannot fulfil the order — maybe an item is out of stock — tap Reject. The customer is notified and can place a new order.",
    ],
    callout: {
      text: "Once accepted, the order moves to the Accepted tab and the customer's status updates in real time.",
    },
  },
  {
    id: "update-status",
    stepNumber: 3,
    icon: XCircle,
    title: "Update order status",
    paragraphs: [
      "After accepting, move the order through the fulfillment pipeline using the status dropdown: Preparing → Ready → Completed. Each transition notifies the customer.",
      "Mark an order as Ready when the food is plated and waiting at the counter. Mark it Completed when it has been served to the table.",
    ],
    tip: {
      text: "The Ready status tells the customer their food is about to arrive. Use it to set expectations.",
    },
  },
  {
    id: "manage-menu",
    stepNumber: 4,
    icon: ClipboardList,
    title: "Manage your menu",
    paragraphs: [
      "From the menu management page, you can add new categories and items, edit existing ones, reorder them, and toggle availability on or off.",
      "Changes take effect immediately. If you run out of an item during service, toggle it off and it disappears from the customer-facing menu without deleting it.",
    ],
    subsections: [
      {
        id: "manage-menu/edit-items",
        title: "Edit items and pricing",
        paragraphs: [
          "Tap an item to open its edit dialog. Update the name, price, description, or photo. Changes are saved instantly and reflected on the live menu.",
        ],
      },
      {
        id: "manage-menu/variants-modifiers",
        title: "Manage variants and modifiers",
        paragraphs: [
          "Add, edit, or remove variants and modifiers from the item detail. Variant prices can be adjusted per size or option. Modifier costs are shown to customers when they customise their order.",
        ],
      },
    ],
  },
  {
    id: "branch-settings",
    stepNumber: 5,
    icon: Settings,
    title: "Configure branch settings",
    paragraphs: [
      "The branch settings page gives you control over your branch's operational status. The main toggle is the ordering switch — turn it off to temporarily stop accepting new orders while keeping your listing visible.",
      "You can also update your branch details: address, phone number, amenities, and the QR code for your tables.",
    ],
  },
  {
    id: "operating-hours",
    stepNumber: 6,
    icon: Calendar,
    title: "Manage operating hours",
    paragraphs: [
      "The weekly hours editor lets you update operating hours for any day of the week. Add multiple time slots per day for split schedules (e.g., lunch and dinner service).",
      "Hours are displayed on your public listing so customers know when you are open before they visit.",
    ],
    accordionItems: [
      {
        trigger: "Can I close for a specific day?",
        content:
          "Yes. Remove all time slots for that day, or toggle the day to closed. The change takes effect immediately.",
      },
    ],
  },
];
