/**
 * @fileoverview PageMeta Utility
 * Manages document head metadata (Title, Description, SEO tags) dynamically.
 * Leverages react-helmet-async to ensure proper rendering in single-page
 * applications and server-side contexts.
 */

import { HelmetProvider, Helmet } from "react-helmet-async";

/**
 * PageMeta Component
 * Updates the browser tab title and meta description for the current route.
 * * @param {string} title - The title to display in the browser tab.
 * @param {string} description - The SEO description for search engine results.
 */
const PageMeta = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
  </Helmet>
);

/**
 * AppWrapper Component
 * High-level provider that must wrap the entire application.
 * Required by react-helmet-async to manage state across the component tree.
 */
export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export default PageMeta;
