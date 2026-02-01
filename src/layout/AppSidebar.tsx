import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import {
  HiOutlineSquares2X2,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineCube,
  HiOutlineBuildingOffice,
  HiOutlineChevronDown,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBriefcase,
  HiChevronUpDown,
  HiOutlineUserGroup,
  HiCalendar,
} from "react-icons/hi2";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const AppSidebar: React.FC = () => {
  const { t } = useTranslation("common");

  const { isExpanded, isMobileOpen, isHovered, setIsHovered, setIsMobileOpen } =
    useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { businessId } = useParams();
  const { user, logout } = useAuth();

  const currentBusiness = user?.memberships.find(
    (m) => m.businessId?._id === businessId,
  )?.businessId;

  const navItems: NavItem[] = [
    {
      icon: <HiOutlineSquares2X2 className="size-6" />,
      name: t("sidebar.nav.dashboard"),
      path: "/",
    },
    {
      icon: <HiOutlineUsers className="size-6" />,
      name: t("sidebar.nav.clients"),
      path: "/clients",
    },
    {
      icon: <HiOutlineCube className="size-6" />,
      name: t("sidebar.nav.items"),
      path: "/items",
    },
    {
      icon: <HiOutlineDocumentText className="size-6" />,
      name: t("sidebar.nav.invoices"),
      path: "/invoices",
    },
    {
      icon: <HiCalendar className="size-6" />,
      name: t("sidebar.nav.calendar"),
      path: "/calendar",
    },
    {
      icon: <HiOutlineBuildingOffice className="size-6" />,
      name: t("sidebar.nav.business_settings"),
      subItems: [
        { name: t("sidebar.sub.general"), path: "/settings" },
        { name: t("sidebar.sub.design"), path: "/templates" },
        { name: t("sidebar.sub.currency"), path: "/currency" },
        { name: t("sidebar.sub.tax"), path: "/taxes" },
      ],
    },
    {
      icon: <HiOutlineUserGroup className="size-6" />,
      name: t("sidebar.nav.team_members"),
      subItems: [
        { name: t("sidebar.sub.all_members"), path: "/members" },
        { name: t("sidebar.sub.invite"), path: "/add-member" },
      ],
    },
  ];

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleSignOut = () => {
    if (logout) logout();
    navigate("/signin");
  };

  const handleSwitchBusiness = () => navigate("/select-business");

  const handleLinkClick = () => {
    if (isMobileOpen) setIsMobileOpen(false);
  };

  const getScopedPath = (path: string) => {
    if (!businessId) return "#";
    const base = `/business/${businessId}`;
    return path === "/" ? base : `${base}${path}`;
  };

  const isActive = useCallback(
    (path: string) => {
      if (!businessId) return false;
      const base = `/business/${businessId}`;
      const fullPath = path === "/" ? base : `${base}${path}`;
      return (
        location.pathname === fullPath || location.pathname === `${fullPath}/`
      );
    },
    [location.pathname, businessId],
  );

  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      nav.subItems?.forEach((subItem) => {
        if (isActive(subItem.path)) {
          setOpenSubmenu({ type: "main", index });
          submenuMatched = true;
        }
      });
    });
    if (!submenuMatched) setOpenSubmenu(null);
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      const element = subMenuRefs.current[key];
      if (element) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: element.scrollHeight,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) =>
      prev && prev.index === index ? null : { type: "main", index },
    );
  };

  const showFullSidebar = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={`fixed top-0 left-0 h-[100dvh] bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 border-r border-gray-200 transition-all duration-300 ease-in-out z-50 flex flex-col 
      ${showFullSidebar ? "w-[290px]" : "w-[90px]"}
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* --- TOP: LOGO & BUSINESS SWITCHER --- */}
      <div className="shrink-0 flex flex-col border-b border-gray-100 dark:border-white/5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-10 transition-all duration-300">
        <div
          className={`h-16 flex items-center transition-all duration-300 ${
            !showFullSidebar ? "justify-center px-0" : "px-6"
          }`}
        >
          <Link
            to={getScopedPath("/")}
            className={`flex items-center justify-center transition-all duration-300 ${
              !showFullSidebar
                ? "w-0 opacity-0 overflow-hidden"
                : "w-auto opacity-100"
            }`}
          >
            <img
              src="/images/logo/logo.svg"
              className="dark:hidden w-32"
              alt="Logo"
            />
            <img
              src="/images/logo/logo-dark.svg"
              className="hidden dark:block w-32"
              alt="Logo"
            />
          </Link>
          {!showFullSidebar && <div className="w-0 h-8"></div>}
        </div>

        <div className="p-4">
          <button
            onClick={handleSwitchBusiness}
            className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all group border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-white/[0.05] hover:bg-brand-50 hover:border-brand-200 dark:hover:bg-brand-500/10 dark:hover:border-brand-500/20 ${
              !showFullSidebar ? "justify-center aspect-square p-0" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-semibold text-sm shrink-0 overflow-hidden shadow-sm">
              {currentBusiness?.logo ? (
                <img
                  src={currentBusiness.logo}
                  className="w-full h-full object-cover"
                  alt="Business Logo"
                />
              ) : (
                <HiOutlineBriefcase className="size-5" />
              )}
            </div>

            {showFullSidebar && (
              <div className="flex-1 text-left overflow-hidden">
                {/* 4. TRANSLATED WORKSPACE LABEL */}
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                  {t("sidebar.workspace.label")}
                </p>
                <p className="text-sm font-semibold truncate text-gray-800 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                  {/* 5. TRANSLATED SELECT BUSINESS FALLBACK */}
                  {currentBusiness?.name || t("sidebar.workspace.select")}
                </p>
              </div>
            )}
            {showFullSidebar && (
              <HiChevronUpDown className="size-5 text-gray-400 group-hover:text-brand-500" />
            )}
          </button>
        </div>
      </div>

      {/* --- MIDDLE: NAVIGATION --- */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-6 px-4 z-0">
        <nav className="space-y-2 pb-6">
          {navItems.map((nav, index) => {
            const isMainActive = openSubmenu?.index === index;
            const activeClasses =
              "bg-brand-50/60 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400";
            const inactiveClasses =
              "text-gray-700 hover:bg-gray-100/50 dark:text-gray-300 dark:hover:bg-white/5";

            return (
              <div key={nav.name}>
                {nav.subItems ? (
                  <>
                    <button
                      onClick={() => handleSubmenuToggle(index)}
                      className={`menu-item group w-full ${
                        isMainActive ? activeClasses : inactiveClasses
                      } ${!showFullSidebar ? "justify-center px-0" : ""}`}
                    >
                      <span
                        className={`menu-item-icon-size ${
                          isMainActive
                            ? "text-brand-500"
                            : "text-gray-400 group-hover:text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {nav.icon}
                      </span>
                      {showFullSidebar && (
                        <span className="menu-item-text flex-1 text-left">
                          {nav.name}
                        </span>
                      )}
                      {showFullSidebar && (
                        <HiOutlineChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isMainActive ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </button>

                    {showFullSidebar && (
                      <div
                        ref={(el) => {
                          subMenuRefs.current[`main-${index}`] = el;
                        }}
                        className="overflow-hidden transition-all duration-300"
                        style={{
                          height: isMainActive
                            ? `${subMenuHeight[`main-${index}`]}px`
                            : "0px",
                        }}
                      >
                        <ul className="mt-1 space-y-1 ml-11 border-l border-gray-200 dark:border-white/10 pl-3">
                          {nav.subItems.map((subItem) => {
                            const isSubActive = isActive(subItem.path);
                            return (
                              <li key={subItem.name}>
                                <Link
                                  to={getScopedPath(subItem.path)}
                                  onClick={handleLinkClick}
                                  className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                    isSubActive
                                      ? "bg-brand-50/50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{subItem.name}</span>
                                    {subItem.pro && (
                                      // 6. TRANSLATED PRO BADGE
                                      <span className="text-[9px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded font-semibold uppercase">
                                        {t("sidebar.badges.pro")}
                                      </span>
                                    )}
                                  </div>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={getScopedPath(nav.path!)}
                    onClick={handleLinkClick}
                    className={`menu-item group ${
                      isActive(nav.path!) ? activeClasses : inactiveClasses
                    } ${!showFullSidebar ? "justify-center px-0" : ""}`}
                  >
                    <span
                      className={`menu-item-icon-size ${
                        isActive(nav.path!)
                          ? "text-brand-500"
                          : "text-gray-400 group-hover:text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {nav.icon}
                    </span>
                    {showFullSidebar && (
                      <span className="menu-item-text">{nav.name}</span>
                    )}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* --- BOTTOM: USER PROFILE --- */}
      <div className="shrink-0 border-t border-gray-100 dark:border-white/5 p-4 bg-white/30 dark:bg-gray-900/30 backdrop-blur-md z-10 pb-[env(safe-area-inset-bottom,20px)]">
        <div
          className={`flex items-center gap-3 ${
            !showFullSidebar ? "justify-center flex-col gap-4 pb-3" : "pb-3"
          }`}
        >
          {/* ADDED onClick={handleLinkClick} HERE */}
          <Link
            to={getScopedPath("/profile")}
            onClick={handleLinkClick} 
            className={`flex items-center gap-3 flex-1 min-w-0 cursor-pointer group ${
              !showFullSidebar ? "justify-center w-full" : ""
            }`}
          >
            <div className="w-10 h-10 shrink-0 rounded-full bg-brand-500 text-white flex items-center justify-center font-semibold text-lg overflow-hidden border-2 border-white dark:border-gray-800 shadow-md group-hover:border-brand-200 transition-colors">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  className="w-full h-full object-cover"
                  alt="Profile"
                />
              ) : (
                user?.name.charAt(0)
              )}
            </div>
            {showFullSidebar && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            )}
          </Link>
          <button
            onClick={handleSignOut}
            className="text-gray-400 hover:text-error-500 transition-colors p-2 rounded-lg hover:bg-error-50 dark:hover:bg-error-500/10"
            title={t("sidebar.actions.sign_out")}
          >
            <HiOutlineArrowRightOnRectangle className="size-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
