# Dastrict Digital Printmedia

A customizable point-of-sale web app for a Dastrict Didgital Printmedia and in completion of our IT Subject System, Analysis and Design. It runs entirely in the browser with plain HTML, CSS, and JavaScript, uses Bootstrap 5 for the layout, and saves data with localStorage, so no server or database is needed.

## Features

- **Sales screen:** product grid with category tabs and search, a cart, discounts, tax, payment method, part payments (downpayments), and printable receipts.
- **Print-specific pricing:** fixed price per piece, price per square foot (tarpaulins, vinyl), and automatic bulk pricing once a quantity threshold is reached.
- **Order tracking:** each order has a status (Pending, In production, Ready, Claimed) and a balance you can collect later.
- **Design preview:** customers can see their own artwork on a T-shirt, tarpaulin, or sticker before ordering. The preview can be downloaded as a PNG or attached to the order.
- **Product management:** add, edit, and delete products and categories.
- **Reports:** filter by today, last 7 days, last 30 days, or all time. Includes total sales, amount collected, unpaid balance, sales by category, and top products. Export to CSV or print the report.
- **Settings:** shop name, currency symbol, tax rate, and JSON backup and restore.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page layout and all five tabs (Sales, Design preview, Products, Reports, Settings) |
| `style.css` | Custom styling and print rules |
| `app.js` | All application logic: cart, checkout, products, reports, designer, and storage |

## Getting started

1. Put `index.html`, `style.css`, and `app.js` in the same folder.
2. Open `index.html` in a modern browser (Chrome, Edge, Firefox, or Safari).
3. Connect to the internet on first load, because Bootstrap and the Google Font load from a CDN.

No installation or build step is required.

## How to use

### Making a sale
1. On the **Sales** tab, click a product to add it to the order. For per-square-foot items, enter the width and height in feet when prompted.
2. Use **+** and **−** to change quantities. Bulk prices apply automatically.
3. Optionally enter a customer name, a discount, and the amount paid. Leave **Amount paid** blank to record full payment.
4. Choose the payment method and order status, then click **Complete sale**. A receipt opens for printing.

### Using the design preview
1. Open the **Design preview** tab and choose a product and base color. For tarpaulins and stickers, enter the width and height so the preview matches the real shape.
2. Upload an image or type text and click **Add**.
3. Select a layer, then drag it on the preview to move it. Use the sliders to resize and rotate it.
4. Click **Download PNG** to share the mockup, or **Attach to order** to include it in the next sale.

### Managing products and categories
Open the **Products** tab. Add categories first, then add products with a name, category, pricing type, price, and optional bulk quantity and bulk price. Use **Edit** or **Delete** in the product list to make changes.

### Reports
Open the **Reports** tab and pick a date range. From the orders list you can change an order's status, collect an outstanding balance, or reprint a receipt. Use **Export CSV** for spreadsheets or **Print report** for a paper copy.

### Settings and backup
Use the **Settings** tab to change the shop name, currency, and tax rate. Click **Export backup** to download all data as a JSON file, and **Restore backup** to load one back in.

## Data storage

Data is stored in your browser's localStorage under the key `printpos_v1`.

- Data stays on the computer and browser where it was entered. It does not sync between devices.
- Clearing browser data or site data erases it.
- Export a backup regularly from the Settings tab.
- Images attached to orders are saved as small compressed thumbnails to keep storage use low. If the browser reports that storage is full, export a backup and reset old data.

## Customizing

- **Starting data:** edit the `seed` object near the top of `app.js` to change the default categories and products.
- **Colors:** the brand colors are CSS variables at the top of `style.css` (`--ink`, `--c`, `--m`, `--y`).
- **Order statuses:** the status list appears in `index.html` (the `#status` dropdown) and in `renderReports()` in `app.js`.
- **Shirt shape:** the T-shirt outline is the `SHIRT` path in `app.js`, and its print area is set in `drawDesign()`.

## Known limitations

- No user accounts or staff logins.
- No charts in the reports yet, only tables and totals.
- The shirt preview is a simple outline, not a photo mockup.
- Receipts open in a pop-up window, so allow pop-ups for the page.
- Everything is stored locally, so there is no multi-device or multi-user sync.

## Ideas for next steps

- Sales charts on the Reports tab.
- Staff logins with owner and cashier roles.
- More mockup types such as mugs and tote bags, or photo-based shirt mockups.
- A backend database for syncing across devices.

## Built with

- HTML5, CSS3, and vanilla JavaScript
- [Bootstrap 5.3](https://getbootstrap.com/) via CDN
- Google Fonts (Bricolage Grotesque)
- Canvas API for the design preview
