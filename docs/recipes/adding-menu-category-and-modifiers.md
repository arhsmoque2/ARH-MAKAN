# Recipe: Adding a Menu Category & Item Modifiers

## Goal
Add a new menu item with required single-select choices (e.g. Patty choice) and optional multi-select add-ons (e.g. Extra Cheese, Turkey Bacon) without breaking POS, KDS, or Customer surfaces.

## Steps

1. **Update `shared/mock-data/menu.json`**:
   ```json
   {
     "id": "truffle-burger",
     "name": "Black Truffle Gourmet Burger",
     "category": "burgers",
     "price": 28.90,
     "description": "Artisanal beef patty with black truffle aioli & aged cheddar.",
     "image": "images/gourmet-burger.png",
     "dietary": ["halal"],
     "station": "grill",
     "modifiers": [
       {
         "id": "patty",
         "name": "Patty Selection",
         "required": true,
         "type": "single",
         "options": [
           { "name": "150g Angus Beef", "price": 0 },
           { "name": "Crispy Buttermilk Chicken", "price": 0 },
           { "name": "Double Patty (+RM10)", "price": 10.00 }
         ]
       },
       {
         "id": "addons",
         "name": "Extra Toppings",
         "required": false,
         "type": "multiple",
         "options": [
           { "name": "Smoked Cheddar", "price": 3.00 },
           { "name": "Truffle Glaze", "price": 4.50 }
         ]
       }
     ]
   }
   ```

2. **Verify Static Schema**:
   ```bash
   node scripts/check.mjs
   ```

3. **Rehearse Customer & POS Render**:
   - Open `/customer/index.html` $\rightarrow$ click item $\rightarrow$ confirm radio group and checkbox choices recalculate price.
   - Place test order $\rightarrow$ verify KDS renders chosen modifiers in amber badge text under the item line.
