import { useTranslation } from "react-i18next";
import GridShape from "../../components/common/GridShape";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";
import LanguageSelector from "../../components/common/LanguageSelector";

interface AuthLayoutProps {
  children: React.ReactNode;
  showLanguageSelector?: boolean;
}

export default function AuthLayout({
  children,
  showLanguageSelector = false,
}: AuthLayoutProps) {
  const { t, i18n } = useTranslation("auth");

  return (
    <div className="relative min-h-screen bg-white z-1 dark:bg-gray-900">
      <div className="relative flex flex-col justify-start w-full min-h-screen lg:flex-row dark:bg-gray-900">
        {/* Main Content Area */}
        <div className="relative flex flex-col flex-1 w-full px-4 py-8 sm:px-6 lg:px-8">
          {/* Top Right Language Selector (Conditional) */}
          {showLanguageSelector && (
            <div className="sm:top-6 z-20 w-48 ml-auto mb-4">
              <LanguageSelector
                value={i18n.language}
                onChange={(lang) => i18n.changeLanguage(lang)}
                label=""
              />
            </div>
          )}

          {children}
        </div>

        {/* Right Sidebar (Desktop only) */}
        <div className="items-center hidden w-full lg:w-1/2  lg:grid">
          <div className="relative flex items-center justify-center z-1">
            <GridShape />
            <div className="flex flex-col items-center max-w-md">
              {/* Added 'group' and 'flex-col items-center' here */}
              <div className="flex flex-col items-center mb-4 group">
                {/* The White Logo */}

                {/* Brand Text */}
                <div className="font-black text-4xl text-brand-600 dark:text-white ">
                  InvoTrack
                </div>
              </div>

              <p className="text-center text-gray-500 font-semibold dark:text-white/60">
                {t("layout.tagline")}
              </p>
            </div>
          </div>
        </div>

        {/* Theme Toggler (Fixed at bottom right) */}
        <div className="fixed z-50 bottom-5 right-5">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
