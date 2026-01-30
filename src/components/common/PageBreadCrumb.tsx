/**
 * @fileoverview PageBreadcrumb Component
 * Standardized header for internal pages.
 * Displays the current page title and contains a commented-out navigational
 * breadcrumb trail for future scalability.
 */

interface BreadcrumbProps {
  pageTitle: string;
}

/**
 * Standard Page Header Utility
 * @param {string} pageTitle - The current display name of the active route.
 */
const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle }) => {
  return (
    <div className="mb-4 md:mb-5 mt-1">
      {/* --- Main Page Heading --- */}
      <h2
        className="text-2xl font-semibold text-gray-800 dark:text-white/90 tracking-wide"
        x-text="pageName"
      >
        {pageTitle}
      </h2>
    </div>
  );
};

export default PageBreadcrumb;
