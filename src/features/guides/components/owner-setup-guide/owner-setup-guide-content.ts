import {
  Building2,
  CheckCircle2,
  ChefHat,
  Mail,
  MapPin,
  Store,
} from "lucide-react";
import type { InteractiveGuideSection } from "@/features/guides/components/interactive-guide-types";

export const OWNER_SETUP_GUIDE_SECTIONS: InteractiveGuideSection[] = [
  {
    id: "accept-invitation",
    stepNumber: 1,
    icon: Mail,
    title: "Accept your invitation link",
    paragraphs: [
      "CravingsPH is invite-only during the MVP phase. A platform admin shares a unique invitation link with you. Open the link in your browser — it takes you to the owner registration page with your invitation pre-validated.",
      "If the invitation includes an email hint, that field is pre-filled. Complete the registration form with your name and password, then sign in to start onboarding.",
    ],
    tip: {
      text: "Invitation links expire after 7 days. If yours has expired, contact CravingsPH to request a new one.",
    },
    accordionItems: [
      {
        trigger: "What if I already have a CravingsPH account?",
        content:
          "The invitation link is for new owner accounts. If you already have a customer account, the invitation creates a separate owner account with the same email.",
      },
    ],
  },
  {
    id: "create-organization",
    stepNumber: 2,
    icon: Building2,
    title: "Create your organization (Step 1 of 5)",
    paragraphs: [
      "The onboarding wizard starts with creating your organization — the top-level container for your restaurants and branches. Enter your business name, which appears on your owner portal dashboard.",
      "Think of the organization as your company or brand. If you own multiple restaurant concepts, they all live under one organization.",
    ],
    callout: {
      text: "The wizard tracks your progress across 5 steps: Organization, Restaurant, Branch, Menu, and Complete. You can return to any step from the setup hub.",
    },
  },
  {
    id: "register-restaurant",
    stepNumber: 3,
    icon: Store,
    title: "Register your restaurant (Step 2 of 5)",
    paragraphs: [
      "Next, add your first restaurant. Enter the restaurant name, select your cuisine types, and add a short description. This information appears on your public listing.",
      "Choose cuisine types carefully — customers use them to filter search results. You can select multiple types if your restaurant serves fusion or mixed cuisine.",
    ],
    tip: {
      text: "Upload a clear, high-quality logo and a wide cover photo that shows your restaurant's atmosphere. These are the first things customers see.",
    },
  },
  {
    id: "add-branch",
    stepNumber: 4,
    icon: MapPin,
    title: "Add a branch location (Step 3 of 5)",
    paragraphs: [
      "Each restaurant needs at least one branch — the physical location where customers dine. Fill in the complete address including street, barangay, city, and province.",
      'The branch name follows the pattern "Restaurant Name - Branch Identifier" (e.g., "Kusina ni Maria - Poblacion"). The restaurant name is locked as a prefix.',
    ],
    subsections: [
      {
        id: "add-branch/address-details",
        title: "Address and contact details",
        paragraphs: [
          "Enter the full street address, select the barangay and city, and add a phone number. Accurate address details help customers find you and are used for the location filter in search.",
        ],
      },
      {
        id: "add-branch/amenities",
        title: "Branch amenities",
        paragraphs: [
          "Select the amenities your branch offers: air conditioning, parking, free Wi-Fi, or outdoor seating. These appear as badges on your listing and help customers decide.",
        ],
      },
    ],
  },
  {
    id: "build-menu",
    stepNumber: 5,
    icon: ChefHat,
    title: "Build your menu (Step 4 of 5)",
    paragraphs: [
      "The menu builder step lets you create your first category and menu item right in the wizard. Enter a category name (e.g., Main Dishes), an item name (e.g., Chicken Adobo), and a price in PHP.",
      "This is a quick-start form to get you up and running. After completing the wizard, you can add more categories, items, variants, and modifiers from the full menu management page in your dashboard.",
    ],
    tip: {
      text: 'You can skip this step by tapping "Skip for Now" and add menu items later from the restaurant management page.',
    },
    subsections: [
      {
        id: "build-menu/quick-start",
        title: "Quick-start form",
        paragraphs: [
          "The wizard form has three fields: Menu Category, First Item Name, and Price (PHP). Fill them in and tap Create Menu Item. If your menu already has content from a previous session, the step shows a completed state.",
        ],
      },
      {
        id: "build-menu/full-menu-later",
        title: "Full menu management",
        paragraphs: [
          'After onboarding, the Manage Menu page lets you add unlimited categories, items with photos and descriptions, variants (sizes, preparations), and modifiers (add-ons, customisations). Access it from the "Manage Menu" quick action on your dashboard.',
        ],
      },
    ],
  },
  {
    id: "completion",
    stepNumber: 6,
    icon: CheckCircle2,
    title: "Complete onboarding (Step 5 of 5)",
    paragraphs: [
      'The final wizard step summarises your setup progress. If all 4 required steps are complete (organization, restaurant, branch, and menu), you see "You\'re All Set!" with a link to your dashboard.',
      'If any steps are incomplete, you see "Almost There" with a list of what still needs to be done. You can go to the setup hub to finish those steps or skip to the dashboard and complete them later.',
    ],
    callout: {
      text: "Your dashboard shows a setup checklist banner until all steps are complete. The checklist has a progress bar and links directly to each incomplete step.",
    },
    accordionItems: [
      {
        trigger: "What counts as complete?",
        content:
          "Your restaurant is launch-ready when you have an organization, at least one restaurant, at least one branch, and at least one menu item. Operating hours can be configured separately from the branch settings page.",
      },
      {
        trigger: "Can I go back and change things after completing?",
        content:
          "Yes. The setup hub at /organization/get-started shows all steps with their completion status. You can revisit any step at any time. Your dashboard quick actions also link to key management pages.",
      },
    ],
  },
];
