<h1 align="center">Ceker-Shopify-Luceed - SYNC Worker</h1>
<p align="center">
  <a href="https://andromeda.technology"><img src="./storage/static/hero.jpg"  alt="Firestarter API" /></a>
  <br />
  <br />
  <h2 align="center">Keep your Shopify and Luceed in SYNC</h2>
  <br />
  <a href="https://andromeda.technology">Andromeda.technology - Official Website</a>
  <br />
  <a href="https://ceker.net">Ceker.net - Croatian Natural & Healthy Foods Shop - Official Webshop</a>
</p>

## Medium.com - Read an article, overview of Features and Use cases

- [📗 Synchronize Your Shopify and Luceed Systems Seamlessly with Andromeda.Technology](https://medium.com/andromeda-technology/synchronize-your-shopify-and-luceed-systems-seamlessly-with-andromeda-technology-1e346c6d84f1)

## Motivation

Built for easier syncing of Luceed and Shopify.

Written in TypeScript, with Interfaces and separated files, folders for each domain (Luceed, Shopify)
and it's sub-domains (Orders, Customers, ShippingData etc.).

This organization greatly helps with understanding of the flow of the sync process between Luceed and Shopify.

Easily extend this codebase to suit your needs.

## What is covered

Most of the basic stuff needed to get your webshop up and running in Shopify,
while having it in Sync with your physical store and inventory (via Luceed).

- View, Create: Orders,
- View, Create: Customers,
- Sync Shopify Orders to Luceed,
- Sync Luceed Products to Shopify.

## Features

- .env: Define if product can be sold when inventory levels < 0
- .env: Define shop wide discounts - via config variable (define percentage) - applied to all products
- Database: Hide/Show products on Webshop
- Database: Make products available only offline (in physical shop)

- Shopify pagination
- Finding, using Shopify PRODUCTS by SKU (defined on product variant)
-- This way, product HANDLE is used for search engine and display purposes only
- Create Luceed Order with default PoslovniPartner if none available from Shopify (because of selected Shopify plan)
-- Then change, optionally and manually, later in Luceed - delivery and contact data
- Saving ShopifyOrder to Luceed, with adding one of two Delivery items a) Free Delivery item, b) Default Delivery item.
-- Based on delivery price on Shopify Order.
- Continue selling products, when out of stock (configurable via .env variable (true/false))
- Two (2) locations: Shop and Webshop: To show inventory per location

## Environment variables

.env variables: Used to Control behaviour of the Sync process (params to access Luceed and Shopify).

Env variables (.env file):

- var1

Database (e.g. MongoDB Atlas):

- is_visible_in_webshop - [true/false] - is product ACTIVE or in DRAFT in Shopify (visible for customers)? Product is always synced, but potentially hidden from customers.

## Payments

- Set default payment by Luceed ID.

## Shopify

- Throttling included - to comply with Shopify request limit (for every call towards Shopify)
-- Configurable

### Customer (default or real), for orders, synced from Shopify to Luceed

If you don't want to sync customer data to Luceed (by choice or by Shopify plan limitations)...
Syncer will assign all Orders to a default customer in Luceed (just make sure to provide UID from Luceed Customer in .env file).

On the other hand, if you do have the plan that provides Customer data,
new customers will be created in Luceed (based on e-mail address and postal address)
or existing ones will be used (if already in Luceed).

## Luceed

- Na Webshopu navodimo samo MPC cijene (ne VPC)

## Shopify Requirements

- Optional: E-mail on checkout (email doesn't need to be part of every ShopifyOrder, as some plans hide it - then add to default User, to change manually in Luceed)
- Optional: Phone on checkout (phone doesn't need to be part of every ShopifyOrder, as some plans hide it - then add to default User, to change manually in Luceed)

## Production requirements

- Heroku (instructions below)
- Fixie on Heroku - for static outbound requests IP adress (instructions below)
- Redis on Heroku (or any other place - just get REDIS_URL) (used for Queue jobs - sync process, as Heroku bails with execution after timeout)

Total production cost per month for micro, shared instance is ~[5,8] USD (Heroku hosting + Redis included).

## Technology of the system

<h1 align="center">Firestarter API - Progressive Startup API Boilerplate</h1>
<p align="center">
  <a href="https://firestarter-api.andromeda.technology"><img src="./storage/static/hero.jpg"  alt="Firestarter API" /></a>
  <br />
  <br />
  <a href="https://firestarter-api.andromeda.technology">Progressive Startup API Boilerplate</a>
  <br />
  <a href="https://firestarter-api.andromeda.technology">https://firestarter-api.andromeda.technology</a>
</p>

Easy to extend, Progressive and Scalable API boilerplate to power your startup.

## 1. Technology

- [TypeScript](https://www.typescriptlang.org/),
- [Koa.js](https://koajs.com/),
- Database: [MongoDB](https://www.mongodb.com/): [Mongoose](https://mongoosejs.com/),
- Config: [Dotenv](https://www.npmjs.com/package/dotenv), [Joi](https://joi.dev/),
- Testing: [Jest](https://jestjs.io/): SuperTest, MongoDBMemoryServer,
- [Docker](https://www.docker.com/): MongoDB.

## 2. Usage

1. Clone the repo,
2. Duplicate `.env.example` files in [`./`,`/docker/`] to `.env`; modify as needed,
3. Have `Docker` [installed](https://www.docker.com/get-started), run the containers and your app (check the instructions below),
4. Add modules (routes, controllers, services, tests) to `/src` (duplicate Message module, adjust to your needs),
5. List newly added modules (features) here (Readme.md) and in your POSTMAN collection.

## 3. Features

1. Message Module,
2. [Add your modules/features here]

All API routes are prefixed by `API_PREFIX` (defined in`.env`) (default: `/api`).

## 4. Setup

**Docker**

Docker provides isolated `MongoDB` for your project.

```
cd ./docker

# Duplicate example env file, modify as needed
cp .env.example .env

docker-compose up -d
```

**Application**

```
# Return from `docker` to root dir
# cd ..

# Duplicate example env file, modify if needed
cp .env.example .env

# Install packages
npm i

# Run
npm run dev
```

## 5. Tests

Using `Jest` Testing Framework.

Jest uses `SuperTest` and `MongoDBMemoryServer`.

```
npm run test
```

## 6. Postman

[Postman Documentation](https://documenter.getpostman.com/view/97483/UUy67k8N)

- (Link your Postman Documentation here)

Pre-set environment variables:

- `host`
- `admin_password`

Dynamic environment variables,
automatically set in tests:

- `access_token`

## 7. Admin Routes

Routes can be protected with `jwtCheck` middleware,
requiring admin rights.

Requests going to these routes require `Authorization: Bearer {access_token}` header.

**List of protected, i.e. Admin Routes**

1. Message[Create,Update,Delete],
2. [Add your protected routes here]

**Getting access_token for the Admin user**

- Request endpoint: `POST /auth/token`,
- Pass your password in the request body: `{ password: ADMIN_PASSWORD }`,
- Response will return created `token`.

Note: Postman collection will automatically set `access_token` environment variable,
so you can immediately call admin routes, without copy-pasting it or setting the env variable manually.

**Getting the ADMIN_PASSWORD**

- Your `ADMIN_PASSWORD` is defined in `.env` file.
- It defaults to `secret`.

## 8. Deployment

### 8.1. MongoDB Atlas

If you use MongoDB Atlas: Uncomment and fill `DB_URI` in `.env`.

### 8.2. Deploying to HEROKU

[Heroku tutorial 1](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
[Heroku tutorial 2](https://devcenter.heroku.com/articles/deploying-nodejs)

### 8.3. Use Fixie for HEROKU static IP

[Fixie, Heroku](https://elements.heroku.com/addons/fixie)
[Fixie, Node](https://devcenter.heroku.com/articles/fixie#using-with-node)

## 9. Social

Andromeda

- [Medium](https://medium.com/andromeda-technology)
- [Twitter](https://twitter.com/andromeda_node)

## 10. Rest

Hero image source: [FireStarter, gilad, DevianArt](https://www.deviantart.com/gilad/art/Firestarter-25634515).

## 11. Related

[🏄 Habitus](https://github.com/AndromedaTechnology/habitus)

- State-of-the-art tracker for emotions, habits and thoughts,
- Healthiest version of you,
- Gamified,
- Anonymous and open source.

## 12. Contribute

Check [Self-Aware Software Artisan](http://selfawaresoftwareartisan.com) before contributing.

<br/>
<h5 align="center">
  <a href="https://startedincroatia.com">Started in Europe, Croatia 🇭🇷</a>
</h5>
<h3 align="center">
  Crafted with ❤️ <br />
  by contributors around the 🌍 World and <a href="https://andromeda.technology/">🌌 Andromeda</a>.
</h3>
