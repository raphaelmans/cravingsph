import type { DemoSeed } from "./demo-restaurant";

export const sugboMercadoGrill: DemoSeed = {
  organization: {
    name: "Demo Food Group",
    slug: "demo-food-group",
    description: "Multi-brand restaurant group for development and testing.",
  },

  restaurant: {
    name: "Sugbo Mercado Grill",
    slug: "sugbo-mercado-grill",
    description:
      "Fresh-off-the-grill seafood and Cebuano street food. Taste the night market experience.",
    cuisineType: "Seafood,Filipino,Grilled",
    isFeatured: true,
  },

  branch: {
    name: "Mandaue Branch",
    slug: "mandaue-branch",
    city: "Mandaue",
    province: "Cebu",
    address: "Unit 5, A.S. Fortuna St., Mandaue City",
    latitude: "10.3236",
    longitude: "123.9223",
  },

  categories: [
    {
      name: "Grilled Seafood",
      sortOrder: 0,
      items: [
        {
          name: "Grilled Tuna Belly",
          description:
            "Thick-cut tuna belly marinated in calamansi and soy, grilled over charcoal.",
          basePrice: "299.00",
          sortOrder: 0,
          modifierGroups: [
            {
              name: "Dipping Sauce",
              isRequired: true,
              minSelections: 1,
              maxSelections: 2,
              sortOrder: 0,
              modifiers: [
                { name: "Soy-Calamansi", price: "0", sortOrder: 0 },
                { name: "Spiced Vinegar", price: "0", sortOrder: 1 },
                { name: "Toyomansi with Chili", price: "0", sortOrder: 2 },
              ],
            },
          ],
        },
        {
          name: "Grilled Squid",
          description:
            "Whole squid stuffed with tomatoes and onions, charcoal-grilled.",
          basePrice: "199.00",
          sortOrder: 1,
        },
        {
          name: "Inihaw na Bangus",
          description:
            "Milkfish stuffed with tomatoes, onions, and ginger, wrapped in banana leaf.",
          basePrice: "249.00",
          sortOrder: 2,
        },
        {
          name: "Garlic Butter Shrimp",
          description:
            "Tiger prawns sauteed in garlic butter with chili flakes.",
          basePrice: "349.00",
          sortOrder: 3,
        },
      ],
    },
    {
      name: "Street Food",
      sortOrder: 1,
      items: [
        {
          name: "Chorizo de Cebu",
          description:
            "Sweet Cebuano sausage, charcoal-grilled. Served with puso.",
          basePrice: "89.00",
          sortOrder: 0,
          variants: [
            { name: "3 Pieces", price: "89.00", sortOrder: 0 },
            { name: "6 Pieces", price: "169.00", sortOrder: 1 },
          ],
        },
        {
          name: "Grilled Pork BBQ",
          description: "Sweet-glazed pork skewers with banana ketchup.",
          basePrice: "25.00",
          sortOrder: 1,
          variants: [
            { name: "3 Sticks", price: "75.00", sortOrder: 0 },
            { name: "5 Sticks", price: "120.00", sortOrder: 1 },
          ],
        },
        {
          name: "Ngohiong",
          description:
            "Cebuano-style spring roll with five-spice pork and vegetables.",
          basePrice: "49.00",
          sortOrder: 2,
        },
      ],
    },
    {
      name: "Soups",
      sortOrder: 2,
      items: [
        {
          name: "Sinigang na Hipon",
          description: "Shrimp in sour tamarind broth with vegetables.",
          basePrice: "239.00",
          sortOrder: 0,
        },
        {
          name: "Tinolang Isda",
          description: "Fish soup with ginger, green papaya, and chili leaves.",
          basePrice: "199.00",
          sortOrder: 1,
        },
      ],
    },
    {
      name: "Drinks",
      sortOrder: 3,
      items: [
        {
          name: "Fresh Mango Shake",
          description: "Blended Cebu mangoes with ice and milk.",
          basePrice: "79.00",
          sortOrder: 0,
        },
        {
          name: "Buko Pandan",
          description: "Young coconut strips in pandan-flavored cream.",
          basePrice: "69.00",
          sortOrder: 1,
        },
        {
          name: "San Miguel Pale Pilsen",
          description: "Ice-cold 330ml bottle.",
          basePrice: "75.00",
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
  ],

  tableSessions: [
    { tableCode: "T-01", status: "active", note: "Night market regulars" },
    { tableCode: "T-05", status: "active" },
  ],
};
