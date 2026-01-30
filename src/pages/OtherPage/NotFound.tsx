/**
 * @fileoverview NotFound Page (404)
 * The fallback component for the routing system.
 * Provides a user-friendly recovery path when a URL does not match any
 * defined routes, ensuring the user isn't left on a blank screen.
 */

import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";

export default function NotFound() {
  return (
    <>
      {/* Updated Meta to reflect the current platform branding */}
      <PageMeta
        title="404 - Page Not Found | Invotrack"
        description="The page you are looking for does not exist or has been moved."
      />

      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1 bg-white dark:bg-gray-900">
        {/* Decorative background grid component */}
        <GridShape />

        <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px] z-10">
          <h1 className="mb-8 font-semibold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl">
            ERROR
          </h1>

          {/* Theme-aware 404 Illustrations */}
          <img
            src="/images/error/404.svg"
            alt="404 Error"
            className="dark:hidden mx-auto"
          />
          <img
            src="/images/error/404-dark.svg"
            alt="404 Error"
            className="hidden dark:block mx-auto"
          />

          <p className="mt-10 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
            We can’t seem to find the page you are looking for!
          </p>

          {/*  Returns user to the safe entry point */}
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 transition-colors"
          >
           Back
          </Link>
        </div>

        {/* --- Footer Copyright --- */}
        <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
          &copy; {new Date().getFullYear()} - Invotrack
        </p>
      </div>
    </>
  );
}
