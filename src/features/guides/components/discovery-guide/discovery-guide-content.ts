import { Filter, MapPin, QrCode, Search, UtensilsCrossed } from "lucide-react";
import type { InteractiveGuideSection } from "@/features/guides/components/interactive-guide-types";

export const DISCOVERY_GUIDE_SECTIONS: InteractiveGuideSection[] = [
  {
    id: "search-restaurants",
    stepNumber: 1,
    icon: Search,
    title: "Search for restaurants",
    paragraphs: [
      "Open the search page and make sure you are in Restaurant mode — the default. Type a restaurant name or keyword into the search bar and tap enter. Results update instantly showing matching restaurants with their cuisine type, location, and popular items.",
      "If you do not have a specific name in mind, leave the search bar empty and browse all available restaurants. The results still respect any filters you have active.",
    ],
    tip: {
      text: 'The home page shows nearby restaurants and a "How it works" section with three steps: Scan QR code, Order from your phone, and Enjoy your meal. Start there if you just want to explore.',
    },
  },
  {
    id: "search-dishes",
    stepNumber: 2,
    icon: UtensilsCrossed,
    title: "Search for dishes",
    paragraphs: [
      'Switch to Food mode using the toggle at the top of the search page. Type a dish name — like "adobo", "sinigang", or "lechon" — and CravingsPH searches across all restaurant menus.',
      "Results are grouped by restaurant. Each result shows the restaurant name and the matching dishes with their prices and photos. This way you can compare the same dish across different restaurants in one view.",
    ],
    tip: {
      text: "Food mode requires a search query. Type at least a few characters to see results.",
    },
  },
  {
    id: "apply-filters",
    stepNumber: 3,
    icon: Filter,
    title: "Filter by location, cuisine, and barangay",
    paragraphs: [
      "In Restaurant mode, use the filter bar below the search input to narrow results. Choose a cuisine type from the horizontal pills, select a city from the location dropdown, or pick a specific barangay.",
      'In Food mode, the barangay filter is available to narrow dish results to restaurants in a specific area. All filters combine — you can search for "lechon" in a specific barangay to find exactly what you want nearby.',
    ],
    callout: {
      text: "Filters persist when you switch between Restaurant and Food modes, except for cuisine which is restaurant-mode only.",
    },
  },
  {
    id: "browse-menu",
    stepNumber: 4,
    icon: MapPin,
    title: "Browse a restaurant's menu",
    paragraphs: [
      "Tap any restaurant card to open its menu page. The page shows the restaurant header with logo, cuisine tags, and contact info, followed by the full menu organised by categories.",
      "Use the category tabs to jump between sections — like Appetisers, Main Course, Drinks, and Desserts. Each menu item shows its name, price, and photo. Tap an item to see its full details, variants, and modifier options.",
    ],
    subsections: [
      {
        id: "browse-menu/search-within",
        title: "Search within the menu",
        paragraphs: [
          "For restaurants with large menus, use the search icon in the menu header to open the menu search sheet. Type a dish name to filter items across all categories without scrolling.",
        ],
      },
    ],
  },
  {
    id: "scan-qr-code",
    stepNumber: 5,
    icon: QrCode,
    title: "Scan a QR code at a table",
    paragraphs: [
      'Tap the "Scan" button in the bottom navigation bar to open the QR scanner. Point your camera at the QR code on your table.',
      "Scanning takes you directly to that restaurant's menu with your table number pre-filled. This skips the search step entirely and gets you ready to order in seconds.",
    ],
    tip: {
      text: "If the QR scanner does not work, you can also search for the restaurant by name and enter your table number manually at checkout.",
    },
  },
];
