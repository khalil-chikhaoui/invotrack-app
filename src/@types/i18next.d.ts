import "i18next";

// Import your English files to use as the "Source of Truth" for types
import common from "../../public/locales/en/common.json";
import auth from "../../public/locales/en/auth.json";
import business from "../../public/locales/en/business.json";
import user from "../../public/locales/en/user.json";
import members from "../../public/locales/en/members.json";

declare module "i18next" {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof common;
      auth: typeof auth;
     business: typeof business;
     user: typeof user;
     members: typeof members;
    };
  }
}
