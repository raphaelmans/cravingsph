/**
 * Demo restaurant fixture data for local development seeding.
 *
 * This file contains one realistic Filipino restaurant with a menu hierarchy
 * that exercises categories, variants, required modifiers, and optional add-ons.
 *
 * Edit content here without touching the seed runner logic.
 */

export type DemoModifier = {
  name: string;
  price: string;
  sortOrder: number;
};

export type DemoModifierGroup = {
  name: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  sortOrder: number;
  modifiers: DemoModifier[];
};

export type DemoVariant = {
  name: string;
  price: string;
  sortOrder: number;
};

export type DemoItem = {
  name: string;
  description?: string;
  basePrice: string;
  sortOrder: number;
  isAvailable?: boolean;
  variants?: DemoVariant[];
  modifierGroups?: DemoModifierGroup[];
};

export type DemoCategory = {
  name: string;
  sortOrder: number;
  items: DemoItem[];
};

export type DemoTable = {
  label: string;
  code: string;
  isActive?: boolean;
  sortOrder: number;
};

export type DemoTableSession = {
  tableCode: string;
  status: "active" | "closed";
  note?: string;
};

export type DemoSeed = {
  organization: { name: string; slug: string; description?: string };
  restaurant: {
    name: string;
    slug: string;
    description?: string;
    cuisineType?: string;
    isFeatured?: boolean;
  };
  branch: {
    name: string;
    slug: string;
    city?: string;
    province?: string;
    address?: string;
    latitude?: string;
    longitude?: string;
  };
  categories: DemoCategory[];
  tables?: DemoTable[];
  tableSessions?: DemoTableSession[];
};

export const demoRestaurant: DemoSeed = {
  organization: {
    name: "Demo Food Group",
    slug: "demo-food-group",
    description: "Multi-brand restaurant group for development and testing.",
  },

  restaurant: {
    name: "Kusina ni Aling Rosa",
    slug: "kusina-ni-aling-rosa",
    description:
      "Authentic Filipino comfort food — from sizzling sisig to creamy halo-halo. Taste of home, every visit.",
    cuisineType: "Filipino",
  },

  branch: {
    name: "Maginhawa Main",
    slug: "maginhawa-main",
    city: "Quezon City",
    province: "Metro Manila",
    address: "123 Maginhawa St., Teachers Village, Quezon City",
  },

  categories: [
    {
      name: "Silog Meals",
      sortOrder: 0,
      items: [
        {
          name: "Tapsilog",
          description:
            "Marinated beef tapa with garlic rice, fried egg, and atchara.",
          basePrice: "149.00",
          sortOrder: 0,
          modifierGroups: [
            {
              name: "Egg Style",
              isRequired: true,
              minSelections: 1,
              maxSelections: 1,
              sortOrder: 0,
              modifiers: [
                { name: "Sunny Side Up", price: "0", sortOrder: 0 },
                { name: "Scrambled", price: "0", sortOrder: 1 },
                { name: "Over Easy", price: "0", sortOrder: 2 },
              ],
            },
            {
              name: "Add-ons",
              isRequired: false,
              minSelections: 0,
              maxSelections: 3,
              sortOrder: 1,
              modifiers: [
                { name: "Extra Rice", price: "25.00", sortOrder: 0 },
                { name: "Extra Egg", price: "20.00", sortOrder: 1 },
                { name: "Atchara", price: "15.00", sortOrder: 2 },
              ],
            },
          ],
        },
        {
          name: "Longsilog",
          description:
            "Sweet longganisa sausage with garlic rice, fried egg, and vinegar dip.",
          basePrice: "129.00",
          sortOrder: 1,
          modifierGroups: [
            {
              name: "Egg Style",
              isRequired: true,
              minSelections: 1,
              maxSelections: 1,
              sortOrder: 0,
              modifiers: [
                { name: "Sunny Side Up", price: "0", sortOrder: 0 },
                { name: "Scrambled", price: "0", sortOrder: 1 },
              ],
            },
          ],
        },
        {
          name: "Bangsilog",
          description:
            "Crispy fried bangus belly with garlic rice, egg, and spiced vinegar.",
          basePrice: "159.00",
          sortOrder: 2,
        },
      ],
    },

    {
      name: "Pulutan",
      sortOrder: 1,
      items: [
        {
          name: "Sizzling Sisig",
          description:
            "Chopped pig face and ears on a sizzling plate with calamansi and chili.",
          basePrice: "189.00",
          sortOrder: 0,
          modifierGroups: [
            {
              name: "Sisig Style",
              isRequired: true,
              minSelections: 1,
              maxSelections: 1,
              sortOrder: 0,
              modifiers: [
                { name: "Classic (Mayo)", price: "0", sortOrder: 0 },
                { name: "Egg on Top", price: "15.00", sortOrder: 1 },
                { name: "Spicy", price: "0", sortOrder: 2 },
              ],
            },
          ],
        },
        {
          name: "Crispy Pata",
          description:
            "Deep-fried pork knuckle served with soy-vinegar dip. Serves 2-3.",
          basePrice: "449.00",
          sortOrder: 1,
        },
        {
          name: "Tokwa't Baboy",
          description:
            "Fried tofu and boiled pork belly in vinegar-soy sauce with onions.",
          basePrice: "129.00",
          sortOrder: 2,
        },
      ],
    },

    {
      name: "Ulam",
      sortOrder: 2,
      items: [
        {
          name: "Kare-Kare",
          description:
            "Oxtail and tripe stewed in peanut sauce with eggplant and string beans. Served with bagoong.",
          basePrice: "259.00",
          sortOrder: 0,
        },
        {
          name: "Sinigang na Baboy",
          description:
            "Pork ribs in sour tamarind broth with kangkong, radish, and green chili.",
          basePrice: "219.00",
          sortOrder: 1,
          variants: [
            { name: "Regular (Solo)", price: "219.00", sortOrder: 0 },
            { name: "Family Size", price: "399.00", sortOrder: 1 },
          ],
        },
        {
          name: "Chicken Adobo",
          description:
            "Classic Filipino braised chicken in soy, vinegar, garlic, and bay leaves.",
          basePrice: "179.00",
          sortOrder: 2,
          modifierGroups: [
            {
              name: "Style",
              isRequired: true,
              minSelections: 1,
              maxSelections: 1,
              sortOrder: 0,
              modifiers: [
                { name: "Saucy", price: "0", sortOrder: 0 },
                { name: "Dry (Adobo Flakes)", price: "0", sortOrder: 1 },
              ],
            },
          ],
        },
        {
          name: "Bicol Express",
          description:
            "Pork belly simmered in coconut milk with shrimp paste and lots of chili.",
          basePrice: "189.00",
          sortOrder: 3,
        },
      ],
    },

    {
      name: "Merienda",
      sortOrder: 3,
      items: [
        {
          name: "Lumpiang Shanghai",
          description:
            "Crispy spring rolls stuffed with pork and vegetables. Served with sweet chili sauce.",
          basePrice: "99.00",
          sortOrder: 0,
          variants: [
            { name: "Half Dozen (6 pcs)", price: "99.00", sortOrder: 0 },
            { name: "Dozen (12 pcs)", price: "179.00", sortOrder: 1 },
          ],
        },
        {
          name: "Palabok",
          description:
            "Rice noodles in shrimp-pork sauce topped with chicharon, egg, and tinapa flakes.",
          basePrice: "139.00",
          sortOrder: 1,
        },
        {
          name: "Turon",
          description:
            "Fried banana spring rolls with jackfruit, caramelized with brown sugar.",
          basePrice: "59.00",
          sortOrder: 2,
          variants: [
            { name: "3 Pieces", price: "59.00", sortOrder: 0 },
            { name: "6 Pieces", price: "109.00", sortOrder: 1 },
          ],
        },
      ],
    },

    {
      name: "Drinks",
      sortOrder: 4,
      items: [
        {
          name: "Sago't Gulaman",
          description:
            "Iced brown sugar syrup with tapioca pearls and grass jelly.",
          basePrice: "49.00",
          sortOrder: 0,
          variants: [
            { name: "Regular (16oz)", price: "49.00", sortOrder: 0 },
            { name: "Large (22oz)", price: "69.00", sortOrder: 1 },
          ],
        },
        {
          name: "Calamansi Juice",
          description:
            "Freshly squeezed Philippine lime juice, lightly sweetened.",
          basePrice: "39.00",
          sortOrder: 1,
        },
        {
          name: "Bottled Water",
          description: "500ml purified water.",
          basePrice: "25.00",
          sortOrder: 2,
        },
        {
          name: "Iced Tea",
          description: "House-brewed iced tea with a hint of lemon.",
          basePrice: "45.00",
          sortOrder: 3,
          variants: [
            { name: "Regular (16oz)", price: "45.00", sortOrder: 0 },
            { name: "Large (22oz)", price: "59.00", sortOrder: 1 },
          ],
        },
      ],
    },

    {
      name: "Desserts",
      sortOrder: 5,
      items: [
        {
          name: "Halo-Halo",
          description:
            "Shaved ice with sweetened beans, fruits, leche flan, ube ice cream, and leche.",
          basePrice: "119.00",
          sortOrder: 0,
          variants: [
            { name: "Regular", price: "119.00", sortOrder: 0 },
            { name: "Special (Extra Toppings)", price: "159.00", sortOrder: 1 },
          ],
        },
        {
          name: "Leche Flan",
          description:
            "Steamed egg custard caramelized with muscovado sugar. Single serving.",
          basePrice: "79.00",
          sortOrder: 1,
        },
        {
          name: "Ube Halaya",
          description:
            "Purple yam jam topped with grated coconut and condensed milk.",
          basePrice: "69.00",
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
    { label: "Counter 1", code: "C-01", sortOrder: 6 },
  ],

  tableSessions: [
    { tableCode: "T-01", status: "active", note: "Family dinner" },
    { tableCode: "T-04", status: "active" },
  ],
};
