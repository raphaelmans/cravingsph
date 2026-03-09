import type { DemoSeed } from "./demo-restaurant";

export const pocheroDecebu: DemoSeed = {
  organization: {
    name: "Pochero de Cebu",
    slug: "pochero-de-cebu",
    description:
      "Cebuano soup house specializing in pochero and other traditional broths.",
  },

  restaurant: {
    name: "Pochero de Cebu",
    slug: "pochero-de-cebu",
    description:
      "Hearty Cebuano soups and stews made from family recipes. Comfort in every bowl.",
    cuisineType: "Filipino,Cebuano,Soup",
  },

  branch: {
    name: "Talisay Branch",
    slug: "talisay-branch",
    city: "Talisay",
    province: "Cebu",
    address: "12 N. Bacalso Ave., Talisay City, Cebu",
    latitude: "10.2447",
    longitude: "123.8494",
  },

  categories: [
    {
      name: "Pochero",
      sortOrder: 0,
      items: [
        {
          name: "Pochero Cebuano",
          description:
            "Beef shank and bone marrow soup with corn, cabbage, green beans, and saba banana in tomato broth.",
          basePrice: "249.00",
          sortOrder: 0,
          variants: [
            { name: "Solo", price: "249.00", sortOrder: 0 },
            { name: "Family (Serves 3-4)", price: "549.00", sortOrder: 1 },
          ],
          modifierGroups: [
            {
              name: "Add Extra",
              isRequired: false,
              minSelections: 0,
              maxSelections: 3,
              sortOrder: 0,
              modifiers: [
                { name: "Extra Bone Marrow", price: "60.00", sortOrder: 0 },
                { name: "Extra Corn", price: "25.00", sortOrder: 1 },
                { name: "Extra Cabbage", price: "20.00", sortOrder: 2 },
              ],
            },
          ],
        },
        {
          name: "Pork Pochero",
          description:
            "Pork belly version of the classic. Rich tomato broth with plantains.",
          basePrice: "229.00",
          sortOrder: 1,
        },
        {
          name: "Chicken Pochero",
          description:
            "Lighter version with chicken thigh. Perfect for a midday meal.",
          basePrice: "199.00",
          sortOrder: 2,
        },
      ],
    },
    {
      name: "Soups and Stews",
      sortOrder: 1,
      items: [
        {
          name: "Bulalo",
          description:
            "Beef marrow bone soup simmered for hours. Collagen-rich and deeply savory.",
          basePrice: "329.00",
          sortOrder: 0,
        },
        {
          name: "Nilagang Baka",
          description:
            "Boiled beef brisket with potatoes, corn, and pechay in clear broth.",
          basePrice: "269.00",
          sortOrder: 1,
        },
        {
          name: "Tinolang Manok",
          description:
            "Chicken ginger soup with green papaya and chili leaves.",
          basePrice: "189.00",
          sortOrder: 2,
        },
        {
          name: "Utan Bisaya",
          description:
            "Mixed vegetable soup with shrimp paste. Cebuano everyday comfort food.",
          basePrice: "129.00",
          sortOrder: 3,
        },
      ],
    },
    {
      name: "Rice and Sides",
      sortOrder: 2,
      items: [
        {
          name: "Plain Rice",
          description: "Steamed white rice.",
          basePrice: "25.00",
          sortOrder: 0,
        },
        {
          name: "Garlic Rice",
          description: "Fried rice with toasted garlic bits.",
          basePrice: "35.00",
          sortOrder: 1,
        },
        {
          name: "Puso",
          description: "Hanging rice in woven coconut leaf. Two pieces.",
          basePrice: "20.00",
          sortOrder: 2,
        },
        {
          name: "Lumpiang Togue",
          description: "Fresh spring rolls with bean sprouts and peanut sauce.",
          basePrice: "69.00",
          sortOrder: 3,
        },
      ],
    },
    {
      name: "Drinks",
      sortOrder: 3,
      items: [
        {
          name: "Sago't Gulaman",
          description: "Tapioca pearls and grass jelly in brown sugar syrup.",
          basePrice: "49.00",
          sortOrder: 0,
        },
        {
          name: "Calamansi Juice",
          description: "Freshly squeezed Philippine lime juice.",
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
};
