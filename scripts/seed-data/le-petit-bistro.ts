/**
 * Le Petit Bistro Manila — French bistro seed fixture.
 *
 * Exercises tables, table sessions, multi-modifier-group items
 * (steak with temp + sauce + wine pairing), and a full 6-category menu.
 */

import type { DemoSeed } from "./demo-restaurant";

export const lePetitBistro: DemoSeed = {
  organization: {
    name: "Demo Food Group",
    slug: "demo-food-group",
    description:
      "Multi-brand restaurant group for development and testing.",
  },

  restaurant: {
    name: "Le Petit Bistro",
    slug: "le-petit-bistro",
    description:
      "Classic French bistro fare — from steak frites to crème brûlée — in a warm, candlelit Makati setting.",
    cuisineType: "French",
    isFeatured: true,
  },

  branch: {
    name: "Legaspi Village",
    slug: "legaspi-village",
    city: "Makati",
    province: "Metro Manila",
    address: "G/F The Columns, 108 Legaspi St., Legaspi Village, Makati City",
    latitude: "14.5547",
    longitude: "121.0244",
  },

  categories: [
    {
      name: "Les Entrées",
      sortOrder: 0,
      items: [
        {
          name: "Soupe à l'Oignon Gratinée",
          description:
            "Classic French onion soup with Gruyère crouton and caramelized onions.",
          basePrice: "380.00",
          sortOrder: 0,
        },
        {
          name: "Salade Niçoise",
          description:
            "Seared tuna, haricots verts, olives, egg, and potatoes in Dijon vinaigrette.",
          basePrice: "450.00",
          sortOrder: 1,
          modifierGroups: [
            {
              name: "Tuna Preparation",
              isRequired: true,
              minSelections: 1,
              maxSelections: 1,
              sortOrder: 0,
              modifiers: [
                { name: "Seared Rare", price: "0", sortOrder: 0 },
                { name: "Seared Medium", price: "0", sortOrder: 1 },
                { name: "Confit", price: "50.00", sortOrder: 2 },
              ],
            },
          ],
        },
        {
          name: "Escargots de Bourgogne",
          description:
            "Six Burgundy snails baked in garlic-parsley butter with crusty bread.",
          basePrice: "520.00",
          sortOrder: 2,
        },
        {
          name: "Tartare de Bœuf",
          description:
            "Hand-cut beef tenderloin with capers, shallots, cornichons, and quail egg.",
          basePrice: "620.00",
          sortOrder: 3,
          modifierGroups: [
            {
              name: "Add-ons",
              isRequired: false,
              minSelections: 0,
              maxSelections: 2,
              sortOrder: 0,
              modifiers: [
                { name: "Truffle Shavings", price: "280.00", sortOrder: 0 },
                { name: "Extra Toast Points", price: "60.00", sortOrder: 1 },
              ],
            },
          ],
        },
        {
          name: "Pâté de Campagne",
          description:
            "Rustic country pâté with cornichons, whole-grain mustard, and toasted brioche.",
          basePrice: "420.00",
          sortOrder: 4,
        },
      ],
    },

    {
      name: "Les Soupes",
      sortOrder: 1,
      items: [
        {
          name: "Velouté de Champignons",
          description:
            "Silky wild mushroom soup finished with crème fraîche and chives.",
          basePrice: "350.00",
          sortOrder: 0,
        },
        {
          name: "Bisque de Homard",
          description:
            "Rich lobster bisque with cognac cream and a hint of cayenne.",
          basePrice: "480.00",
          sortOrder: 1,
        },
        {
          name: "Potage Parmentier",
          description:
            "Velvety leek and potato soup served hot with crusty bread.",
          basePrice: "320.00",
          sortOrder: 2,
        },
      ],
    },

    {
      name: "Les Plats Principaux",
      sortOrder: 2,
      items: [
        {
          name: "Steak Frites",
          description:
            "250g Australian ribeye with hand-cut frites, watercress, and maître d'hôtel butter.",
          basePrice: "1650.00",
          sortOrder: 0,
          modifierGroups: [
            {
              name: "Temperature",
              isRequired: true,
              minSelections: 1,
              maxSelections: 1,
              sortOrder: 0,
              modifiers: [
                { name: "Bleu (Very Rare)", price: "0", sortOrder: 0 },
                { name: "Saignant (Rare)", price: "0", sortOrder: 1 },
                { name: "À Point (Medium Rare)", price: "0", sortOrder: 2 },
                { name: "Cuit (Medium)", price: "0", sortOrder: 3 },
                { name: "Bien Cuit (Well Done)", price: "0", sortOrder: 4 },
              ],
            },
            {
              name: "Sauce",
              isRequired: false,
              minSelections: 0,
              maxSelections: 1,
              sortOrder: 1,
              modifiers: [
                { name: "Béarnaise", price: "0", sortOrder: 0 },
                { name: "Au Poivre", price: "0", sortOrder: 1 },
                { name: "Bordelaise", price: "0", sortOrder: 2 },
                { name: "Roquefort", price: "50.00", sortOrder: 3 },
              ],
            },
            {
              name: "Wine Pairing",
              isRequired: false,
              minSelections: 0,
              maxSelections: 1,
              sortOrder: 2,
              modifiers: [
                {
                  name: "Glass of Côtes du Rhône",
                  price: "380.00",
                  sortOrder: 0,
                },
                {
                  name: "Glass of Bordeaux",
                  price: "450.00",
                  sortOrder: 1,
                },
              ],
            },
          ],
        },
        {
          name: "Confit de Canard",
          description:
            "Slow-cooked duck leg confit with Sarladaise potatoes and mesclun salad.",
          basePrice: "1450.00",
          sortOrder: 1,
          modifierGroups: [
            {
              name: "Side Choice",
              isRequired: true,
              minSelections: 1,
              maxSelections: 1,
              sortOrder: 0,
              modifiers: [
                { name: "Sarladaise Potatoes", price: "0", sortOrder: 0 },
                { name: "Ratatouille", price: "0", sortOrder: 1 },
                { name: "Haricots Verts", price: "0", sortOrder: 2 },
              ],
            },
          ],
        },
        {
          name: "Coq au Vin",
          description:
            "Braised chicken in red wine with lardons, pearl onions, and mushrooms.",
          basePrice: "1280.00",
          sortOrder: 2,
        },
        {
          name: "Bouillabaisse Marseillaise",
          description:
            "Provençal seafood stew with prawns, mussels, fish, and rouille toast.",
          basePrice: "1850.00",
          sortOrder: 3,
        },
        {
          name: "Saumon Meunière",
          description:
            "Pan-seared salmon in brown butter with capers and lemon.",
          basePrice: "1380.00",
          sortOrder: 4,
          modifierGroups: [
            {
              name: "Side Choice",
              isRequired: true,
              minSelections: 1,
              maxSelections: 1,
              sortOrder: 0,
              modifiers: [
                { name: "Pommes Purée", price: "0", sortOrder: 0 },
                { name: "Steamed Vegetables", price: "0", sortOrder: 1 },
                { name: "Mixed Green Salad", price: "0", sortOrder: 2 },
              ],
            },
          ],
        },
        {
          name: "Magret de Canard",
          description:
            "Pan-roasted duck breast with cherry gastrique and fondant potato.",
          basePrice: "1580.00",
          sortOrder: 5,
          modifierGroups: [
            {
              name: "Side Choice",
              isRequired: true,
              minSelections: 1,
              maxSelections: 1,
              sortOrder: 0,
              modifiers: [
                { name: "Fondant Potato", price: "0", sortOrder: 0 },
                { name: "Gratin Dauphinois", price: "0", sortOrder: 1 },
                { name: "Seasonal Vegetables", price: "0", sortOrder: 2 },
              ],
            },
          ],
        },
      ],
    },

    {
      name: "Les Fromages",
      sortOrder: 3,
      items: [
        {
          name: "Assiette de Fromages",
          description:
            "Selection of three French cheeses with honeycomb, walnuts, and fig compote.",
          basePrice: "580.00",
          sortOrder: 0,
        },
        {
          name: "Camembert Rôti",
          description:
            "Whole baked Camembert with garlic, thyme, and toasted baguette.",
          basePrice: "520.00",
          sortOrder: 1,
        },
        {
          name: "Salade de Chèvre Chaud",
          description:
            "Warm goat cheese on toast with mixed greens, walnuts, and honey vinaigrette.",
          basePrice: "450.00",
          sortOrder: 2,
        },
      ],
    },

    {
      name: "Les Desserts",
      sortOrder: 4,
      items: [
        {
          name: "Crème Brûlée",
          description: "Classic vanilla custard with caramelized sugar crust.",
          basePrice: "380.00",
          sortOrder: 0,
          modifierGroups: [
            {
              name: "Flavor",
              isRequired: true,
              minSelections: 1,
              maxSelections: 1,
              sortOrder: 0,
              modifiers: [
                { name: "Classic Vanilla", price: "0", sortOrder: 0 },
                { name: "Earl Grey", price: "0", sortOrder: 1 },
                { name: "Lavender", price: "0", sortOrder: 2 },
                { name: "Espresso", price: "0", sortOrder: 3 },
              ],
            },
          ],
        },
        {
          name: "Tarte Tatin",
          description: "Upside-down caramelized apple tart with crème fraîche.",
          basePrice: "420.00",
          sortOrder: 1,
        },
        {
          name: "Mousse au Chocolat",
          description:
            "Dark Valrhona chocolate mousse with cocoa tuile and sea salt.",
          basePrice: "380.00",
          sortOrder: 2,
        },
        {
          name: "Profiteroles",
          description:
            "Choux pastry filled with vanilla ice cream, drizzled with warm chocolate sauce.",
          basePrice: "420.00",
          sortOrder: 3,
        },
        {
          name: "Mille-Feuille",
          description:
            "Crispy puff pastry layered with vanilla pastry cream and fresh berries.",
          basePrice: "520.00",
          sortOrder: 4,
        },
      ],
    },

    {
      name: "Les Boissons",
      sortOrder: 5,
      items: [
        {
          name: "Café",
          description: "French-press coffee, single origin.",
          basePrice: "150.00",
          sortOrder: 0,
          variants: [
            { name: "Espresso", price: "150.00", sortOrder: 0 },
            { name: "Double Espresso", price: "180.00", sortOrder: 1 },
            { name: "Café Crème", price: "200.00", sortOrder: 2 },
          ],
        },
        {
          name: "Thé",
          description: "Premium loose-leaf teas.",
          basePrice: "160.00",
          sortOrder: 1,
          variants: [
            { name: "Earl Grey", price: "160.00", sortOrder: 0 },
            { name: "Chamomile", price: "160.00", sortOrder: 1 },
            { name: "Darjeeling", price: "180.00", sortOrder: 2 },
          ],
        },
        {
          name: "Citron Pressé",
          description:
            "Freshly squeezed lemon juice served with sugar syrup and sparkling water.",
          basePrice: "180.00",
          sortOrder: 2,
        },
        {
          name: "Jus de Fruits Frais",
          description: "Freshly squeezed seasonal fruit juice.",
          basePrice: "200.00",
          sortOrder: 3,
          variants: [
            { name: "Orange", price: "200.00", sortOrder: 0 },
            { name: "Pineapple", price: "200.00", sortOrder: 1 },
            { name: "Watermelon", price: "220.00", sortOrder: 2 },
          ],
        },
        {
          name: "Perrier",
          description: "330ml sparkling mineral water.",
          basePrice: "280.00",
          sortOrder: 4,
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
    { label: "Bar 1", code: "B-01", sortOrder: 8 },
    { label: "Bar 2", code: "B-02", sortOrder: 9 },
  ],

  tableSessions: [
    {
      tableCode: "T-01",
      status: "active",
      note: "Anniversary dinner — complimentary champagne",
    },
    {
      tableCode: "T-03",
      status: "active",
      note: "Business lunch — separate checks requested",
    },
    { tableCode: "T-05", status: "active" },
  ],
};
