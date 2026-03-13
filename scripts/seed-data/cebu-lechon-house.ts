import type { DemoSeed } from "./demo-restaurant";

export const cebuLechonHouse: DemoSeed = {
  organization: {
    name: "Demo Food Group",
    slug: "demo-food-group",
    description: "Multi-brand restaurant group for development and testing.",
  },

  restaurant: {
    name: "Cebu Lechon House",
    slug: "cebu-lechon-house",
    description:
      "Authentic Cebuano lechon — crispy skin, juicy meat, and unforgettable flavor. A Cebu institution.",
    cuisineType: "Filipino,Cebuano",
    isFeatured: true,
  },

  branch: {
    name: "Colon Main",
    slug: "colon-main",
    city: "Cebu City",
    province: "Cebu",
    address: "45 Colon St., Cebu City",
    latitude: "10.3157",
    longitude: "123.8854",
  },

  categories: [
    {
      name: "Lechon",
      sortOrder: 0,
      items: [
        {
          name: "Lechon Belly (1kg)",
          description:
            "Boneless pork belly slow-roasted over charcoal. Crispy skin, tender meat. Serves 4-5.",
          basePrice: "850.00",
          sortOrder: 0,
          variants: [
            { name: "1 kg", price: "850.00", sortOrder: 0 },
            { name: "Half kg", price: "450.00", sortOrder: 1 },
          ],
        },
        {
          name: "Lechon Kawali",
          description:
            "Deep-fried pork belly chunks served with liver sauce and vinegar dip.",
          basePrice: "249.00",
          sortOrder: 1,
        },
        {
          name: "Spicy Lechon",
          description:
            "House special lechon belly rubbed with chili, lemongrass, and garlic.",
          basePrice: "899.00",
          sortOrder: 2,
        },
      ],
    },
    {
      name: "Rice Meals",
      sortOrder: 1,
      items: [
        {
          name: "Lechon Rice",
          description:
            "Chopped lechon belly over garlic rice with pickled papaya and liver sauce.",
          basePrice: "179.00",
          sortOrder: 0,
          modifierGroups: [
            {
              name: "Sauce",
              isRequired: true,
              minSelections: 1,
              maxSelections: 1,
              sortOrder: 0,
              modifiers: [
                { name: "Liver Sauce", price: "0", sortOrder: 0 },
                { name: "Vinegar Dip", price: "0", sortOrder: 1 },
                { name: "Both", price: "0", sortOrder: 2 },
              ],
            },
          ],
        },
        {
          name: "Puso (Hanging Rice)",
          description:
            "Traditional Cebuano rice wrapped in woven coconut leaves.",
          basePrice: "15.00",
          sortOrder: 1,
        },
        {
          name: "Garlic Rice",
          description: "Fragrant fried rice with toasted garlic bits.",
          basePrice: "35.00",
          sortOrder: 2,
        },
      ],
    },
    {
      name: "Sides",
      sortOrder: 2,
      items: [
        {
          name: "Atchara",
          description: "Pickled green papaya with bell pepper and raisins.",
          basePrice: "45.00",
          sortOrder: 0,
        },
        {
          name: "Ensaladang Talong",
          description:
            "Grilled eggplant salad with tomatoes, onions, and bagoong.",
          basePrice: "69.00",
          sortOrder: 1,
        },
        {
          name: "Dinuguan",
          description:
            "Pork blood stew with vinegar and chili. Perfect with puso.",
          basePrice: "149.00",
          sortOrder: 2,
        },
      ],
    },
    {
      name: "Drinks",
      sortOrder: 3,
      items: [
        {
          name: "Buko Juice",
          description: "Fresh young coconut water served in the shell.",
          basePrice: "59.00",
          sortOrder: 0,
        },
        {
          name: "Iced Tea",
          description: "House-brewed iced tea.",
          basePrice: "39.00",
          sortOrder: 1,
        },
        {
          name: "Bottled Water",
          description: "500ml purified water.",
          basePrice: "25.00",
          sortOrder: 2,
        },
      ],
    },
  ],

  tables: [
    { label: "Table 1", code: "T-01", sortOrder: 0 },
    { label: "Table 2", code: "T-02", sortOrder: 1 },
    { label: "Table 3", code: "T-03", sortOrder: 2 },
    { label: "Table 4", code: "T-04", sortOrder: 3 },
    { label: "Table 5", code: "T-05", sortOrder: 4 },
    { label: "Table 6", code: "T-06", sortOrder: 5 },
    { label: "Table 7", code: "T-07", sortOrder: 6 },
    { label: "Table 8", code: "T-08", sortOrder: 7 },
  ],

  tableSessions: [
    { tableCode: "T-02", status: "active", note: "Group lunch — 6 pax" },
    { tableCode: "T-06", status: "active" },
  ],
};
