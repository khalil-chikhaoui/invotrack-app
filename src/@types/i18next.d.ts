import "i18next";

// Import your English files to use as the "Source of Truth" for types
import common from "../../public/locales/en/common.json";
import auth from "../../public/locales/en/auth.json";
import business from "../../public/locales/en/business.json";
import user from "../../public/locales/en/user.json";
import client from "../../public/locales/en/client.json";

import client_details from "../../public/locales/en/client_details.json";
import item from "../../public/locales/en/item.json";
import item_details from "../../public/locales/en/item_details.json";

import invoice from "../../public/locales/en/invoice.json";
import invoice_details from "../../public/locales/en/invoice_details.json";
import members from "../../public/locales/en/members.json";

import home from "../../public/locales/en/home.json";

declare module "i18next" {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof common;
      auth: typeof auth;
      business: typeof business;
      user: typeof user;
      client: typeof client;
      client_details: typeof client_details;
      item: typeof item;
      item_details: typeof item_details;
      invoice: typeof invoice;
       invoice_details: typeof invoice_details;
      members: typeof members;
      home: typeof home;
    };
  }
}
  