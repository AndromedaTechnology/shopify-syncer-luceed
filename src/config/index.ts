import Joi from "joi";

import * as dotenv from "dotenv";
dotenv.config();

/**
 * Schema
 */

const envSchema = Joi.object()
  .keys({
    // APP
    APP_ENV: Joi.string().optional().default("local"),
    APP_PORT: Joi.number().optional(),
    APP_SECRET: Joi.string().optional().default("secret"),
    API_PREFIX: Joi.string().optional().default("/api"),

    // Admin
    ADMIN_PASSWORD: Joi.string().optional().default("secret"),

    // DB
    // If available, DB_URI is preferred over other db vars
    DB_URI: Joi.string().optional(),
    DB_HOST: Joi.string().optional().default("localhost"),
    DB_PORT: Joi.number().optional().default(27019),
    DB_DATABASE: Joi.string().optional().default("database"),
    DB_USER: Joi.string().optional().default("user"),
    DB_PASSWORD: Joi.string().optional().default(""),

    // Shopify API
    SHOPIFY_SHOP_NAME: Joi.string().optional().default(""),
    SHOPIFY_WEBSHOP_LOCATION_ID: Joi.string().optional().default(""),
    SHOPIFY_SHOP_LOCATION_ID: Joi.string().optional().default(""),
    SHOPIFY_ACCESS_TOKEN: Joi.string().optional().default(""),

    // LUCEED API
    LUCEED_USERNAME: Joi.string().optional().default(""),
    LUCEED_PASSWORD: Joi.string().optional().default(""),
    LUCEED_NALOG_STATUS: Joi.string().optional().default(""),
    LUCEED_NALOG_PRODAJE_SKLADISTE_UID: Joi.string().optional().default(""),
    LUCEED_NALOG_PRODAJE_SA__SKLADISTE_UID: Joi.string().optional().default(""),
    LUCEED_NALOG_PRODAJE_NA__SKLADISTE_UID: Joi.string().optional().default(""),
    LUCEED_NALOG_PRODAJE_SKL_DOKUMENT: Joi.string().optional().default(""),
    LUCEED_NALOG_PRODAJE_VRSTA_PLACANJA_POUZECE_UID: Joi.string()
      .optional()
      .default(""),
    LUCEED_PARTNER_PARENT_UID: Joi.string().optional().default(""),

    // REDIS
    REDIS_URL: Joi.string().optional().default(""),
  })
  .unknown()
  .required();

/**
 * Validate
 */

const { error, value: envVars } = envSchema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

/**
 * Export
 */

export interface IConfig {
  app_env: string;
  app_port: number;
  app_secret: string;
  api_prefix: string;
  admin_password: string;
  db_uri: string;

  // Shopify API
  shopify_shop_name: string;
  shopify_webshop_location_id: string;
  shopify_shop_location_id: string;
  shopify_access_token: string;

  // Luceed API
  luceed_username: string;
  luceed_password: string;
  luceed_nalog_status: string;
  luceed_nalog_prodaje_skladiste_uid: string;
  luceed_nalog_prodaje_sa__skladiste_uid: string;
  luceed_nalog_prodaje_na__skladiste_uid: string;
  luceed_nalog_prodaje_skl_dokument: string;
  luceed_nalog_prodaje_vrsta_placanja_pouzece_uid: string;
  luceed_partner_parent_uid: string;

  // Redis
  redis_url: string;
}

const db_uri_additional = `?authSource=admin&w=1`;
const db_uri_auth = `${envVars.DB_USER}:${envVars.DB_PASSWORD}@`;
const db_uri = `mongodb://${db_uri_auth}${envVars.DB_HOST}:${envVars.DB_PORT}/${envVars.DB_DATABASE}${db_uri_additional}`;

const config: IConfig = {
  app_env: envVars.APP_ENV,
  app_port: process.env.PORT || envVars.APP_PORT || 8080,
  app_secret: envVars.APP_SECRET,
  api_prefix: envVars.API_PREFIX,
  admin_password: envVars.ADMIN_PASSWORD,
  db_uri: envVars.DB_URI ?? db_uri, // If available, env.DB_URI is preferred over other db vars

  // Shopify API
  shopify_shop_name: envVars.SHOPIFY_SHOP_NAME,
  shopify_webshop_location_id: envVars.SHOPIFY_WEBSHOP_LOCATION_ID,
  shopify_shop_location_id: envVars.SHOPIFY_SHOP_LOCATION_ID,
  shopify_access_token: envVars.SHOPIFY_ACCESS_TOKEN,

  // Luceed API
  luceed_username: envVars.LUCEED_USERNAME,
  luceed_password: envVars.LUCEED_PASSWORD,
  luceed_nalog_status: envVars.LUCEED_NALOG_STATUS,
  luceed_nalog_prodaje_skladiste_uid:
    envVars.LUCEED_NALOG_PRODAJE_SKLADISTE_UID,
  luceed_nalog_prodaje_sa__skladiste_uid:
    envVars.LUCEED_NALOG_PRODAJE_SA__SKLADISTE_UID,
  luceed_nalog_prodaje_na__skladiste_uid:
    envVars.LUCEED_NALOG_PRODAJE_NA__SKLADISTE_UID,
  luceed_nalog_prodaje_skl_dokument: envVars.LUCEED_NALOG_PRODAJE_SKL_DOKUMENT,
  luceed_nalog_prodaje_vrsta_placanja_pouzece_uid:
    envVars.LUCEED_NALOG_PRODAJE_VRSTA_PLACANJA_POUZECE_UID,
  luceed_partner_parent_uid: envVars.LUCEED_PARTNER_PARENT_UID,

  // REDIS
  redis_url: envVars.REDIS_URL,
};
export default config;
