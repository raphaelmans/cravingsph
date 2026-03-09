import type { DemoSeed } from "./demo-restaurant";

export const cafeCebuano: DemoSeed = {
  organization: {
    name: "Cafe Cebuano",
    slug: "cafe-cebuano",
    description:
      "Specialty coffee shop and bakery in the heart of Cebu IT Park.",
  },

  restaurant: {
    name: "Cafe Cebuano",
    slug: "cafe-cebuano",
    description:
      "Locally roasted coffee and freshly baked Cebuano pastries. Your cozy corner in IT Park.",
    cuisineType: "Coffee,Bakery,Pastries",
  },

  branch: {
    name: "IT Park",
    slug: "it-park",
    city: "Cebu City",
    province: "Cebu",
    address: "Ground Floor, Skyrise 1, IT Park, Cebu City",
    latitude: "10.3303",
    longitude: "123.9058",
  },

  categories: [
    {
      name: "Coffee",
      sortOrder: 0,
      items: [
        {
          name: "Cebuano Brew",
          description:
            "Single-origin Cebu highland beans, medium roast. Pour-over or French press.",
          basePrice: "129.00",
          sortOrder: 0,
          modifierGroups: [
            {
              name: "Brew Method",
              isRequired: true,
              minSelections: 1,
              maxSelections: 1,
              sortOrder: 0,
              modifiers: [
                { name: "Pour Over", price: "0", sortOrder: 0 },
                { name: "French Press", price: "0", sortOrder: 1 },
                { name: "Aeropress", price: "20.00", sortOrder: 2 },
              ],
            },
          ],
        },
        {
          name: "Cafe Latte",
          description: "Double espresso with steamed milk. Smooth and creamy.",
          basePrice: "149.00",
          sortOrder: 1,
          variants: [
            { name: "Hot", price: "149.00", sortOrder: 0 },
            { name: "Iced", price: "159.00", sortOrder: 1 },
          ],
        },
        {
          name: "Ube Latte",
          description:
            "House specialty -- espresso with ube syrup and oat milk. A Cebuano twist.",
          basePrice: "179.00",
          sortOrder: 2,
          variants: [
            { name: "Hot", price: "179.00", sortOrder: 0 },
            { name: "Iced", price: "189.00", sortOrder: 1 },
          ],
        },
        {
          name: "Espresso",
          description: "Double shot of our house blend.",
          basePrice: "99.00",
          sortOrder: 3,
        },
        {
          name: "Americano",
          description: "Double espresso diluted with hot water.",
          basePrice: "119.00",
          sortOrder: 4,
          variants: [
            { name: "Hot", price: "119.00", sortOrder: 0 },
            { name: "Iced", price: "129.00", sortOrder: 1 },
          ],
        },
      ],
    },
    {
      name: "Pastries",
      sortOrder: 1,
      items: [
        {
          name: "Rosquillos",
          description:
            "Traditional Cebuano ring-shaped cookies. Crispy and buttery.",
          basePrice: "89.00",
          sortOrder: 0,
          variants: [
            { name: "Box of 6", price: "89.00", sortOrder: 0 },
            { name: "Box of 12", price: "169.00", sortOrder: 1 },
          ],
        },
        {
          name: "Otap",
          description:
            "Flaky oval-shaped Cebuano puff pastry with sugar coating.",
          basePrice: "79.00",
          sortOrder: 1,
          variants: [
            { name: "Box of 6", price: "79.00", sortOrder: 0 },
            { name: "Box of 12", price: "149.00", sortOrder: 1 },
          ],
        },
        {
          name: "Banana Bread",
          description: "Moist banana bread with walnuts. Baked fresh daily.",
          basePrice: "69.00",
          sortOrder: 2,
        },
        {
          name: "Ensaimada",
          description: "Soft brioche-style bun topped with butter and sugar.",
          basePrice: "59.00",
          sortOrder: 3,
        },
      ],
    },
    {
      name: "Sandwiches",
      sortOrder: 2,
      items: [
        {
          name: "Longganisa Pandesal",
          description:
            "Sweet Cebuano longganisa in warm pandesal with pickled atchara.",
          basePrice: "119.00",
          sortOrder: 0,
        },
        {
          name: "Grilled Cheese Panini",
          description:
            "Three-cheese panini with sun-dried tomatoes on sourdough.",
          basePrice: "159.00",
          sortOrder: 1,
        },
        {
          name: "Tuna Melt",
          description: "Tuna salad with melted cheddar on ciabatta bread.",
          basePrice: "149.00",
          sortOrder: 2,
        },
      ],
    },
    {
      name: "Non-Coffee",
      sortOrder: 3,
      items: [
        {
          name: "Tablea Hot Chocolate",
          description:
            "Rich cacao made from Cebu tablea discs. Traditional Filipino hot chocolate.",
          basePrice: "129.00",
          sortOrder: 0,
        },
        {
          name: "Matcha Latte",
          description: "Ceremonial-grade matcha with steamed milk.",
          basePrice: "169.00",
          sortOrder: 1,
          variants: [
            { name: "Hot", price: "169.00", sortOrder: 0 },
            { name: "Iced", price: "179.00", sortOrder: 1 },
          ],
        },
        {
          name: "Fresh Dalandan Juice",
          description: "Freshly squeezed native orange juice.",
          basePrice: "79.00",
          sortOrder: 2,
        },
      ],
    },
  ],
};
