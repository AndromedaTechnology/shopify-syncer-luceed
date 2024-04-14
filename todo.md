# TODO

## TODO: Luceed: Get NaloziProdaje: Which `statuses` are to be passed in request

## DONE: TODO: Test: Update product, from Luceed to Shopify, if exists

- TODO: Set variant.id when updating product and variant

- prices
- title

## WIP: DONE: TODO: Shopify Get orders

- filter those needed to save to Luceed

## WIP: Luceed [Create] Order

## Luceed [Create] Customer

## Product sync

- Shopify.prices
-- Set ProductVariant[mpc,vpc,nc]
-- set mpc, nc - for shopify products

- Shopify.this is a physical product = true
-- set on all products

- Disable [showing,selling] for some products,

- Shopify.Debounce
-- "Exceeded 2 calls per second for api client."

- Shopify.Paginate
-- InventoryItems

- luceed.aritkl - parseInt - try{}catch{} - to handle if string (with leading zeroes) can't be covnerted to int.
-- Handle: Remove 000 prefixes from Luceed.handle
-- then break

## Production

- save for webshop location

## Other

- Too big response size - Koa.js - for sync process,
- Sync DECIMAL amount to inventory (current only integer)

- Webshop has MPC or VPC prices?,
- Price: 2 or 3 decimal points?,

- Match Shopify.sku with Luceed.aritkl
-- Currently matching handle (to find if product exists in shopify)
--- Match this with SKU, as we have that saved properly.

- Show [raspolozivo,dostupno] for amount on webshop?

## Cronjobs

1. Order sync (Shopify -> Luceed) - every 5 minutes
2. Inventory sync (Luceed --> Shopify) - every 30 minutes

## Later

- Shopify webhooks - Order[Created,Updated,Deleted]

## Shopify [Updated,Deleted] Order

## TODO: Luceed [Update,Delete] Order

## Luceed [Update,Delete] Customer
