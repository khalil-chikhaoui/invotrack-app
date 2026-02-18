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
  HiOutlineTruck,
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
      icon: <HiOutlineSquares2X2 className="size-5" />,
      name: t("sidebar.nav.dashboard"),
      path: "/",
    },
    {
      icon: <HiOutlineDocumentText className="size-5" />,
      name: t("sidebar.nav.invoices"),
      path: "/invoices",
    },
    {
      icon: <HiOutlineTruck className="size-5" />,
      name: t("sidebar.nav.delivery"),
      path: "/delivery",
    },
    {
      icon: <HiOutlineUsers className="size-5" />,
      name: t("sidebar.nav.clients"),
      path: "/clients",
    },
    {
      icon: <HiOutlineCube className="size-5" />,
      name: t("sidebar.nav.items"),
      path: "/items",
    },
    // FUTURE DEV
    //{
    //  icon: <HiCalendar className="size-5" />,
    // name: t("sidebar.nav.calendar"),
    //  path: "/calendar",
    // },
    {
      icon: <HiOutlineBuildingOffice className="size-5" />,
      name: t("sidebar.nav.business_settings"),
      subItems: [
        { name: t("sidebar.sub.general"), path: "/settings" },
        { name: t("sidebar.sub.design"), path: "/templates" },
        { name: t("sidebar.sub.currency"), path: "/currency" },
        { name: t("sidebar.sub.tax"), path: "/taxes" },
      ],
    },
    {
      icon: <HiOutlineUserGroup className="size-5" />,
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
      className={`fixed top-0 left-0 h-[100dvh] 
      bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-xl 
      border-r border-gray-200/50 dark:border-white/5 
      text-gray-900 dark:text-gray-100
      transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] z-50 flex flex-col 
      ${showFullSidebar ? "w-[280px]" : "w-[90px]"}
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* --- TOP: LOGO & BUSINESS SWITCHER --- */}
      <div className="shrink-0 flex flex-col border-b border-gray-100 dark:border-white/5 z-10">
        <div
          className={`h-16 flex items-center transition-all duration-300 ${
            !showFullSidebar ? "justify-center px-0" : "px-6"
          }`}
        >
          {/*<Link
            to={getScopedPath("/")}
            onClick={handleLinkClick}
            className={`flex items-center justify-center transition-all duration-500 ${
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
          </Link>*/}
          {!showFullSidebar && <div className="w-0 h-8"></div>}
        </div>

        <div className="p-2">
          <button
            onClick={handleSwitchBusiness}
            className={`w-full flex items-center gap-3 p-1.5 rounded-xl transition-all group 
            border border-gray-200/50 dark:border-white/5 
            bg-gray-50/50 dark:bg-white/[0.03] 
            hover:bg-white hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 
            dark:hover:bg-white/[0.08] dark:hover:border-white/10
            ${!showFullSidebar ? "justify-center aspect-square p-0" : ""}`}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden shadow-sm">
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
              <div className="flex-1 text-left overflow-hidden px-1 py-2">
                <p className="text-[10px] font-medium text-gray-600  dark:text-gray-300 uppercase tracking-widest mb-0.5">
                  {t("sidebar.workspace.label")}
                </p>
                <p className="text-sm font-semibold truncate text-gray-700 dark:text-gray-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {currentBusiness?.name || t("sidebar.workspace.select")}
                </p>
              </div>
            )}
            {showFullSidebar && (
              <HiChevronUpDown className="size-4 text-gray-400 group-hover:text-brand-500" />
            )}
          </button>
        </div>
      </div>

      {/* --- MIDDLE: NAVIGATION --- */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-6 px-3 z-0">
        <nav className="space-y-1">
          {navItems.map((nav, index) => {
            const isMainActive = openSubmenu?.index === index;

            // Refined Active State
            const activeClasses =
              "bg-brand-100/80 dark:bg-brand-400/15 text-brand-600 dark:text-brand-300 shadow-sm shadow-brand-500/5 font-semibold";
            const inactiveClasses =
              "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-100 font-medium";

            return (
              <div key={nav.name}>
                {nav.subItems ? (
                  <>
                    <button
                      onClick={() => handleSubmenuToggle(index)}
                      className={`group w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 mb-1 ${
                        isMainActive
                          ? "text-brand-600 dark:text-brand-300 bg-gray-50 dark:bg-white/5 font-semibold"
                          : inactiveClasses
                      } ${!showFullSidebar ? "justify-center px-0 aspect-square" : ""}`}
                    >
                      <span
                        className={`transition-colors duration-200 ${
                          isMainActive
                            ? "text-brand-600 dark:text-brand-300"
                            : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
                        }`}
                      >
                        {nav.icon}
                      </span>
                      {showFullSidebar && (
                        <span className="flex-1 text-left text-sm tracking-tight">
                          {nav.name}
                        </span>
                      )}
                      {showFullSidebar && (
                        <HiOutlineChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-300 opacity-50 group-hover:opacity-100 ${
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
                        className="overflow-hidden transition-all duration-300 ease-in-out"
                        style={{
                          height: isMainActive
                            ? `${subMenuHeight[`main-${index}`]}px`
                            : "0px",
                        }}
                      >
                        <ul className="mt-0.5 space-y-0.5 ml-5 border-l border-gray-200/60 dark:border-white/5 pl-3 mb-2">
                          {nav.subItems.map((subItem) => {
                            const isSubActive = isActive(subItem.path);
                            return (
                              <li key={subItem.name}>
                                <Link
                                  to={getScopedPath(subItem.path)}
                                  onClick={handleLinkClick}
                                  className={`block py-2 px-3 rounded-lg text-sm transition-all duration-200 relative ${
                                    isSubActive
                                      ? "text-brand-600 dark:text-brand-300 font-semibold bg-brand-50/50 dark:bg-brand-500/10 translate-x-1"
                                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{subItem.name}</span>
                                    {subItem.pro && (
                                      <span className="text-[9px] bg-gradient-to-r from-brand-500 to-indigo-500 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide shadow-sm shadow-brand-500/20">
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
                    className={`group flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 mb-1 ${
                      isActive(nav.path!) ? activeClasses : inactiveClasses
                    } ${!showFullSidebar ? "justify-center px-0 aspect-square" : ""}`}
                  >
                    <span
                      className={`transition-colors duration-200 ${
                        isActive(nav.path!)
                          ? "text-brand-600 dark:text-brand-300"
                          : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
                      }`}
                    >
                      {nav.icon}
                    </span>
                    {showFullSidebar && (
                      <span className="text-sm tracking-tight">{nav.name}</span>
                    )}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* --- BOTTOM: USER PROFILE --- */}
      <div className="shrink-0 border-t border-gray-100 dark:border-white/5 p-4 bg-gray-50/50 dark:bg-white/[0.02] backdrop-blur-md">
        <div
          className={`flex items-center gap-3 ${
            !showFullSidebar ? "justify-center flex-col gap-4 pb-0" : "pb-0"
          }`}
        >
          <Link
            to={getScopedPath("/profile")}
            onClick={handleLinkClick}
            className={`flex items-center gap-3 flex-1 min-w-0 cursor-pointer group ${
              !showFullSidebar ? "justify-center w-full" : ""
            }`}
          >
            <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-gray-200 flex items-center justify-center font-bold text-sm overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm group-hover:border-brand-300 transition-colors">
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
                <p className="text-sm font-bold text-gray-800 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {user?.name}
                </p>
                <p className="text-[11px] text-gray-400 font-medium truncate">
                  {user?.email}
                </p>
              </div>
            )}
          </Link>

          <button
            onClick={handleSignOut}
            className={`text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 ${
              !showFullSidebar ? "mt-2" : ""
            }`}
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
