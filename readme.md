<h1 align="center">Ceker-Shopify-Luceed - SYNC Worker</h1>
<p align="center">
  <a href="https://andromeda.technology"><img src="./storage/static/hero.jpg"  alt="Firestarter API" /></a>
  <br />
  <br />
  <a href="https://andromeda.technology">Keep your Shopify and Luceed in SYNC</a>
  <br />
  <a href="https://andromeda.technology">https://andromeda.technology</a>
</p>

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

- Hide/Show products on Webshop
- Make products available only offline (in physical shop)
- Shopify pagination
- Finding, using Shopify PRODUCTS by SKU (defined on product variant)
-- This way, product HANDLE is used for search engine and display purposes only

## Modular

- .env variables: Used to Control behaviour of the Sync process (params to access Luceed and Shopify)
- Two (2) locations: Shop and Webshop: To show inventory per location

## Luceed

- Na Webshopu navodimo samo MPC cijene (ne VPC)

## Shopify Requirements

- Required: E-mail on checkout (email needs to be part of every ShopifyOrder)
- Required: Phone on checkout (phone needs to be part of every ShopifyOrder)

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

If you use MongoDB Atlas: Uncomment and fill `DB_URI` in `.env`.

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
