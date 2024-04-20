# TODO

## TODO: Mjesto

- Otvori novog Partnera
-- Gledaj po E-mail AND Mjesto isporuke - to je najbolje - ako ne postoji onda kreiraj novog Partnera

- Ako mjesto nema postanski broj u Luceedu
-- Onda treba kreirati Mjesto u Luceedu
-- `mjesto` i `mjesto_uid` MORAJU BITI POSTALVJENI NA PARTNERU
-- `mjesto` i `drzava` treba kreirati
- query `mjesto` i ako ne postoji onda post `mjesto` (mjesto sa postanskim brojem, naziv koji covjek unese i postanski broj)

## TODO: Partneri: Grupa

- PoslovniPartneri.create: grupa_partnera_uid = 6-3228.

##

- TODO: Disable [showing,selling] for some products,
-- Find shopify.props for [hidding,disablingSelling] on product
-- Draft for product in Admin? To hide?
-- 0 available for disabled selling?
-- Manage 2 locations - Physical store and Webshop. Make physical store have amount if not available for webshop.

- TODO: Update Luceed Order - cancelled,closed_at

- Test Different Orders - from Shopify to Luceed
- Canceled order
- Failed payment
- Canceled payment
- Sucessful payment
- Diff amounts for products - check prices
- Diff amounts for products - check amounts

- Test Diff customers
-- Without and with address etc.

- DONE: Shopify: Require email (DONE), phone ALSO (DONE:)

- DONE: Test: Add delivery data to Luceed orders

- DONE: Check: Sync Shopify Orders to Luceed (not saved yet) (check narudzba, compare with shopifyId)

- DONE: Check: Sync Shopify Order.Customer to Luceed (not saved yet) (check customer, by email)

- DONE: TEST: Luceed [Create] Customer

- DONE: TEST: Luceed [Create] Order

- DONE: Test: Shopify: Touch/Update product and variant
-- DONE: Shopify Product update: Create default variant if non-existent
-- DONE: Update product, from Luceed to Shopify, if exists
-- DONE: Set variant.id when updating product and variant
-- DONE: Update
--- prices (mpc,vpc,nc)
--- title

- DONE: Test: Shopify Get orders
-- filter those needed to save to Luceed
-- Save in MongoDB - `synced_orders.id` - add new row for each saved order to Luceed (from Shopify)

## Product sync

- Shopify.this is a physical product = true
-- set on all products

- DONE: Test: Shopify.Paginate
-- InventoryItems

- DONE: TODO: Test: luceed.aritkl - parseInt - try{}catch{} - to handle if string (with leading zeroes) can't be covnerted to int.
-- Handle: Remove 000 prefixes from Luceed.handle
-- then break

## Shopify: Production

- save for webshop location inventory
-- Find location for production.webshop - set in .env

## Other

- Too big response size - Koa.js - for sync process,

- Not needed?: Sync DECIMAL amount to inventory (current only integer)
-- Meat is not selling
-- We have 4 pieces and that's it, it's not needed to know exact size. That goes by variants etc.? Not needed.

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
