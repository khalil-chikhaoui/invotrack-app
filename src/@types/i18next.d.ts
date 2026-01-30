import "i18next";

// Import your English files to use as the "Source of Truth" for types
import common from "../../public/locales/en/common.json";
import auth from "../../public/locales/en/auth.json";
import sidebar from "../../public/locales/en/sidebar.json"; // <--- Import this
declare module "i18next" {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof common;
      auth: typeof auth;
      sidebar: typeof sidebar;
    };
  }
}
