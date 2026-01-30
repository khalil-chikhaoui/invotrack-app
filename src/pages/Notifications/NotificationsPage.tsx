import { useState } from "react";
import { useParams, Link } from "react-router";
// import { notificationsApi, NotificationData } from "../../apis/notifications"; // ❌ API Not ready
// import { formatDistanceToNow } from "date-fns"; // ❌ Date logic commented out for now
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import { HiCheckCircle, HiOutlineBellAlert } from "react-icons/hi2";

export default function NotificationsPage() {
  const { businessId } = useParams(); 
  
  const [notifications, setNotifications] = useState<any[]>([
    {
        _id: "1",
        isRead: false,
        type: "welcome",
        sender: { name: "System Admin", profileImage: "" },
        createdAt: new Date(),
        text: "Welcome to Invotrack! This is where you will see updates.",
        project: { name: "General" }
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  /* ---------------------------------------------------------
     ❌ API LOGIC COMMENTED OUT UNTIL BACKEND IS READY
  --------------------------------------------------------- */
  /*
  const fetchMore = useCallback(async (resetPage = false) => {
      // API Call logic...
  }, [page, loading, hasMore]);

  useEffect(() => {
    fetchMore();
  }, []);

  const handleMarkAsRead = async (notifId: string, isRead: boolean) => {
      // API Call logic...
  };
  */

  // ✅ MOCK HANDLER: Just visual update
  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    setTimeout(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setMarkingAll(false);
    }, 500);
  };

  return (
    <div className="mx-auto pb-20 px-4">
      <PageMeta description="Notifications" title="Activity Feed | Invotrack" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <HiOutlineBellAlert className="text-orange-500" /> Notifications
          </h1>
          <p className="text-gray-500 text-sm">
            Stay updated with your latest business activity
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400 rounded-xl hover:bg-orange-100 transition-colors disabled:opacity-50"
          >
            <HiCheckCircle className="size-5" />
            {markingAll ? "Marking..." : "Mark all as read"}
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
        {notifications.length === 0 && !loading ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-full mb-4">
              <HiOutlineBellAlert className="size-8 text-gray-300" />
            </div>
            <p className="text-gray-400">No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.map((n) => (
              <Link
                key={n._id}
                to="#" // ✅ FIX: Safe Link for now
                className={`flex gap-4 p-6 transition-all hover:bg-gray-50 dark:hover:bg-white/5 relative ${
                  !n.isRead
                    ? "bg-brand-500/[0.04] dark:bg-brand-500/[0.08]"
                    : ""
                }`}
              >
                {/* Avatar */}
                <img
                  src={
                    n.sender.profileImage ||
                    `https://ui-avatars.com/api/?name=${n.sender.name}&background=random`
                  }
                  className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-gray-900 flex-shrink-0"
                  alt=""
                />
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white text-base">
                      {n.sender.name}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      Just now
                      {/* {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })} */}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm leading-relaxed">
                    {n.text}
                  </p>

                  <div className="flex items-center justify-between">
                    <Badge
                      variant="light"
                      size="sm"
                      className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    >
                      {n.project?.name || "System"}
                    </Badge>

                    {!n.isRead && (
                      <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 text-xs font-semibold uppercase tracking-wider">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                        New
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {loading && (
          <div className="p-10 flex justify-center border-t dark:border-gray-700">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
}