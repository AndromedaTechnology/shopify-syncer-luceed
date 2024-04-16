# TODO

- DONE: TEST: Luceed [Create] Customer

- TODO: Luceed [Create] Order

- TODO: Shopify.prices
-- Set ProductVariant[mpc,vpc,nc]
-- set mpc, nc - for shopify products

- TODO: Luceed: Get NaloziProdaje: Which `statuses` are to be passed in request

- DONE: TODO: Test: Shopify: Touch/Update product and variant
-- DONE: Shopify Product update: Create default variant if non-existent
-- DONE: Update product, from Luceed to Shopify, if exists
-- DONE: Set variant.id when updating product and variant
-- DONE: Update
--- prices (mpc,vpc,nc)
--- title

- WIP: DONE: TODO: Shopify Get orders
-- filter those needed to save to Luceed
-- Save in MongoDB - `synced_orders.id` - add new row for each saved order to Luceed (from Shopify)

## Product sync

- Disable [showing,selling] for some products,

- Shopify.this is a physical product = true
-- set on all products

- DONE: TODO: Test: Shopify.Paginate
-- InventoryItems

- DONE: TODO: Test: luceed.aritkl - parseInt - try{}catch{} - to handle if string (with leading zeroes) can't be covnerted to int.
-- Handle: Remove 000 prefixes from Luceed.handle
-- then break

## Production

- save for webshop location
-- Find location for production.webshop - set in .env

## Other

- Too big response size - Koa.js - for sync process,

- Not needed?: Sync DECIMAL amount to inventory (current only integer)
-- Meat is not selling
-- We have 4 pieces and that's it, it's not needed to know exact size. That goes by variants etc.? Not needed.

- DONE: Webshop has MPC or VPC prices?, MPC! DONE!

- TODO: Check: Price: 2 or 3 decimal points?,

- DONE: TODO: Test: Match Shopify.sku with Luceed.aritkl
-- Currently matching handle (to find if product exists in shopify)
--- Match this with SKU, as we have that saved properly.
-- Handle and SKU MUST BE THE SAME!

- DONE: Show [raspolozivo,stanje] for amount on webshop? Rasplozivo (as stanje is hard value, raspolozivo takes reservations into account)

## Cronjobs

1. Order sync (Shopify -> Luceed) - every 5 minutes
2. Inventory sync (Luceed --> Shopify) - every 30 minutes

## Later

- TODO: Shopify [Updated,Deleted] Order
-- To update in Luceed, if user updated in Shopify

- TODO: Luceed [Update,Delete] Order
-- To send email update to Shopify customer

- Later: Luceed [Update,Delete] Customer

- Later: Shopify webhooks - Order[Created,Updated,Deleted]
