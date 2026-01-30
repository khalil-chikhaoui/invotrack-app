import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Link, useParams } from "react-router"; 
import { formatDistanceToNow } from "date-fns";

// --- Types ---
interface NotificationData {
  _id: string;
  isRead: boolean;
  type: "mention" | "new_comment" | "new_discussion" | "task_assigned" | "update";
  text?: string;
  createdAt: string;
  sender: {
    name: string;
    profileImage?: string;
  };
  project: {
    _id: string;
    name: string;
  };
  discussion?: {
    _id: string;
    title: string;
  };
}

// --- Mock Data ---
const MOCK_NOTIFICATIONS: NotificationData[] = [
  {
    _id: "1",
    isRead: false,
    type: "mention",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    sender: { name: "Alice Johnson", profileImage: "" },
    project: { _id: "p1", name: "Website Redesign" },
    discussion: { _id: "d1", title: "Homepage Layout" },
  },
  {
    _id: "2",
    isRead: false,
    type: "task_assigned",
    text: "Fix navigation bug",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    sender: { name: "Bob Smith", profileImage: "" },
    project: { _id: "p1", name: "Website Redesign" },
  },
  {
    _id: "3",
    isRead: true,
    type: "new_comment",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    sender: { name: "Charlie Davis", profileImage: "" },
    project: { _id: "p2", name: "Mobile App" },
    discussion: { _id: "d2", title: "Authentication Flow" },
  },
];

export default function NotificationDropdown() {
  const { orgId } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load Mock Data
  useEffect(() => {
    setNotifications(MOCK_NOTIFICATIONS);
    setUnreadCount(MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length);
  }, []);

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const getNotifText = (type: string) => {
    switch (type) {
      case "mention": return "tagged you in";
      case "new_comment": return "replied to";
      case "new_discussion": return "started a thread";
      case "task_assigned": return "assigned you to";
      default: return "sent an update";
    }
  };

  const getLinkPath = (n: NotificationData) => {
    if (!n.project?._id) return "#";
    
    if (n.type === "task_assigned") {
        return `/org/${orgId}/projects/${n.project._id}/tasks`;
    }
    const discussionId = n.discussion?._id || "";
    return `/org/${orgId}/projects/${n.project._id}/discussions/${discussionId}`;
  };

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full h-11 w-11 hover:text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0.5 z-10 h-2.5 w-2.5 rounded-full bg-orange-500 border-2 border-white dark:border-gray-900">
            <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
          </span>
        )}

        <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20">
          <path
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        // UPDATED CLASSNAME:
        // 1. right-0: Aligns right (instead of -right-[240px])
        // 2. w-[calc(100vw-2rem)]: Sets width to full viewport width minus padding on mobile
        // 3. max-w-[360px]: Prevents it from getting huge on desktop
        className="absolute right-0 mt-3 flex flex-col w-[calc(100vw-2rem)] max-w-[360px] max-h-[480px] rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications ({unreadCount})
          </h5>
        </div>

        <ul className="flex flex-col overflow-y-auto custom-scrollbar">
          {notifications.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              All caught up!
            </div>
          )}

          {notifications.map((n) => (
            <li key={n._id}>
              <Link
                to={getLinkPath(n)}
                onClick={() => {
                  handleMarkRead(n._id);
                  setIsOpen(false);
                }}
                className={`flex gap-3 rounded-lg border-b border-gray-50 dark:border-gray-800 p-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${
                  !n.isRead
                    ? "bg-brand-500/[0.04] dark:bg-brand-500/[0.08]"
                    : ""
                }`}
              >
                <div className="relative block w-10 h-10 rounded-full flex-shrink-0">
                  <img
                    src={
                      n.sender?.profileImage ||
                      `https://ui-avatars.com/api/?name=${n.sender?.name || "User"}`
                    }
                    alt={n.sender?.name}
                    className="w-full h-full overflow-hidden rounded-full object-cover"
                  />
                  {!n.isRead && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-500 dark:border-gray-900"></span>
                  )}
                </div>

                <div className="block flex-1 min-w-0">
                  <span className="mb-1 block text-theme-sm text-gray-500 dark:text-gray-400 leading-snug">
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {n.sender?.name}
                    </span>{" "}
                    {getNotifText(n.type)}
                    <span className="font-medium text-gray-800 dark:text-white block truncate">
                      {n.type === "task_assigned"
                        ? `Task: ${n.text || "New Task"}`
                        : n.discussion?.title}
                    </span>
                  </span>

                  <span className="flex items-center gap-2 text-gray-400 text-theme-xs">
                    <span className="truncate max-w-[100px]">
                      {n.project?.name}
                    </span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span>
                      {formatDistanceToNow(new Date(n.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-auto shrink-0 pt-3">
          <Link
            to={`/org/${orgId}/notifications`}
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
          >
            View All Notifications
          </Link>
        </div>
      </Dropdown>
    </div>
  );
}