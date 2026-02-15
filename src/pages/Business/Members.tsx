/**
 * @fileoverview Members Management Page
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { businessApi } from "../../apis/business";
import { useAuth } from "../../context/AuthContext";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useModal } from "../../hooks/useModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import { Modal } from "../../components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import {
  TrashBinIcon,
  UserCircleIcon,
  PlusIcon,
  PencilIcon,
} from "../../icons";
import {
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineArrowPath,
} from "react-icons/hi2";
import { HiOutlineLogout } from "react-icons/hi";
import { usePermissions } from "../../hooks/usePermissions";
import LoadingState from "../../components/common/LoadingState";

interface Member {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  role: string;
  title: string;
  invitationStatus: "Pending" | "Accepted";
  createdAt?: string;
}

export default function Members() {
  const { t } = useTranslation("members");
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const { canManageSettings } = usePermissions();

  // --- Main Table States ---
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // --- Modal & Action States ---
  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();
  const {
    isOpen: isLeaveOpen,
    openModal: openLeaveModal,
    closeModal: closeLeaveModal,
  } = useModal();
  const {
    isOpen: isRoleOpen,
    openModal: openRoleModal,
    closeModal: closeRoleModal,
  } = useModal();

  const [memberToDelete, setMemberToDelete] = useState<{
    id: string;
    name: string;
    status: string;
  } | null>(null);
  const [memberToUpdate, setMemberToUpdate] = useState<Member | null>(null);
  const [selectedRole, setSelectedRole] = useState("");

  const [deleting, setDeleting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);

  /**
   * Data Fetching
   */
  const fetchData = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await businessApi.getMembers(businessId, searchTerm);
      if (Array.isArray(data)) setMembers(data);
    } catch (error) {
      console.error("Fetch members failed", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Debounced Search
   */
  useEffect(() => {
    const delay = setTimeout(() => fetchData(), 400);
    return () => clearTimeout(delay);
  }, [searchTerm, businessId]);

  // --- Handlers ---

  const handleConfirmRoleChange = async () => {
    if (!businessId || !memberToUpdate) return;
    setUpdatingRole(true);
    try {
      await businessApi.updateMemberRole(
        businessId,
        memberToUpdate.id,
        selectedRole,
      );
      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberToUpdate.id ? { ...m, role: selectedRole } : m,
        ),
      );
      closeRoleModal();
    } catch (error: any) {
      const errorCode = error.message;
      alert(t(`errors.${errorCode}` as any, t("errors.GENERIC_ERROR")));
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete || !businessId) return;
    setDeleting(true);
    try {
      await businessApi.removeMember(businessId, memberToDelete.id);
      setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
      setMemberToDelete(null);
      closeDeleteModal();
    } catch (error: any) {
      const errorCode = error.message;
      alert(t(`errors.${errorCode}` as any, t("errors.GENERIC_ERROR")));
    } finally {
      setDeleting(false);
    }
  };

  const handleConfirmLeave = async () => {
    if (!businessId) return;
    setLeaving(true);
    try {
      const response = await businessApi.leaveBusiness(businessId);
      if (setUser) setUser(response.user);
      navigate("/select-business");
    } catch (error: any) {
      const errorCode = error.message;
      alert(t(`errors.${errorCode}` as any, t("errors.GENERIC_ERROR")));
    } finally {
      setLeaving(false);
    }
  };

  /**
   * Expiration Logic
   */
  const getDaysRemaining = (createdAt?: string) => {
    if (!createdAt) return null;
    const created = new Date(createdAt);
    if (isNaN(created.getTime())) return null;

    const expires = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const diffTime = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return t("status.expired");
    if (diffDays === 1) return t("status.expires_today");
    return t("status.days_left", {
      count: diffDays,
      defaultValue: "{{count}} days left",
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "success";
      case "Manager":
        return "info";
      case "Deliver":
        return "warning";
      default:
        return "light";
    }
  };

  // Helper to translate roles safely
  const translateRole = (role: string) => {
    return t(`roles.${role}` as any, role);
  };

  return (
    <>
      <PageMeta
        title={t("list.title") + " | Invotrack"}
        description={t("list.subtitle")}
      />
      <PageBreadcrumb pageTitle={t("list.title")} />

      <div className="w-full space-y-8">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          {/* --- Filters Header --- */}
          <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-white/[0.05]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end text-start">
              <div className="flex-1 text-start">
                <Input
                  placeholder={t("list.search_placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                {canManageSettings && (
                  <Button
                    onClick={() =>
                      navigate(`/business/${businessId}/add-member`)
                    }
                    className="h-11 flex items-center gap-2 text-[10px] font-semibold  tracking-widest px-6"
                  >
                    <PlusIcon className="fill-current size-5" />{" "}
                    {t("list.add_button")}
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={fetchData}
                  disabled={loading}
                  className="h-11 flex items-center gap-2 text-[10px] font-semibold  tracking-widest px-4 border-gray-200 dark:border-white/10"
                >
                  <HiOutlineArrowPath
                    className={`size-5 ${loading ? "animate-spin" : ""}`}
                  />
                  {t("status.refresh", { defaultValue: "Refresh" })}
                </Button>
              </div>
            </div>
          </div>

          {/* --- Personnel Registry Table --- */}
          <div className="max-w-full overflow-x-auto text-start">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-4 text-start font-semibold text-gray-500 text-[10px]  tracking-widest whitespace-nowrap"
                  >
                    {t("list.columns.member")}
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-4 text-start font-semibold text-gray-500 text-[10px]  tracking-widest whitespace-nowrap"
                  >
                    Title
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-4 text-start font-semibold text-gray-500 text-[10px]  tracking-widest whitespace-nowrap"
                  >
                    {t("list.columns.status")}
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-4 text-start font-semibold text-gray-500 text-[10px]  tracking-widest whitespace-nowrap"
                  >
                    {t("list.columns.role")}
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-4 text-end font-semibold text-gray-500 text-[10px]  tracking-widest whitespace-nowrap"
                  >
                    {t("list.columns.actions")}
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading && members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-0">
                      <LoadingState
                        message={t("status.loading", {
                          defaultValue: "Syncing...",
                        })}
                        minHeight="300px"
                      />
                    </TableCell>
                  </TableRow>
                ) : members.length === 0 ? (
                  <TableRow>
                    <td
                      colSpan={5}
                      className="p-10 text-center text-gray-500 text-theme-sm dark:text-gray-300 font-medium"
                    >
                      {t("list.empty.title")}
                    </td>
                  </TableRow>
                ) : (
                  members.map((member) => {
                    const isCurrentUser = user?._id === member.id;
                    const admins = members.filter(
                      (m) =>
                        m.role === "Admin" && m.invitationStatus === "Accepted",
                    );
                    const isLastAdmin =
                      isCurrentUser &&
                      member.role === "Admin" &&
                      admins.length === 1;
                    const daysLeft =
                      member.invitationStatus === "Pending"
                        ? getDaysRemaining(member.createdAt)
                        : null;

                    return (
                      <TableRow
                        key={member.id}
                        className="text-start hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors"
                      >
                        {/* Member Identity */}
                        <TableCell className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0">
                              {member.profileImage ? (
                                <img
                                  src={member.profileImage}
                                  className="object-cover w-full h-full"
                                  alt=""
                                />
                              ) : (
                                <UserCircleIcon className="size-6 text-gray-300" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-theme-sm text-gray-800 dark:text-white leading-tight  tracking-tight">
                                {member.name}{" "}
                                {isCurrentUser && (
                                  <span className="text-brand-500 ml-1 text-[9px]">
                                    (YOU)
                                  </span>
                                )}
                              </span>
                              <span className="text-gray-400 text-[10px] font-semibold  tracking-widest mt-1">
                                {member.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Title */}
                        <TableCell className="px-5 py-4 text-theme-sm font-semibold text-gray-500 dark:text-gray-400  text-[10px] tracking-tight whitespace-nowrap">
                          {member.title || "Staff"}
                        </TableCell>

                        {/* Access Status */}
                        <TableCell className="px-5 py-4 whitespace-nowrap">
                          <div className="flex flex-col items-start gap-1">
                            <Badge
                              color={
                                member.invitationStatus === "Accepted"
                                  ? "success"
                                  : "warning"
                              }
                              className="font-semibold text-[9px]  tracking-widest px-3"
                            >
                              <div className="flex items-center gap-1.5">
                                {member.invitationStatus === "Pending" && (
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute h-full w-full rounded-full bg-warning-400 opacity-75"></span>
                                    <span className="relative rounded-full h-1.5 w-1.5 bg-warning-500"></span>
                                  </span>
                                )}
                                {t(
                                  `status.${member.invitationStatus.toLowerCase()}` as any,
                                  member.invitationStatus,
                                )}
                              </div>
                            </Badge>
                            {member.invitationStatus === "Pending" &&
                              daysLeft && (
                                <div className="flex items-center gap-1 text-[9px] font-semibold text-gray-400  tracking-wide ml-1">
                                  <HiOutlineClock className="size-3" />{" "}
                                  {daysLeft}
                                </div>
                              )}
                          </div>
                        </TableCell>

                        {/* Permissions / Role */}
                        <TableCell className="px-5 py-4 whitespace-nowrap">
                          <div
                            onClick={() => {
                              if (
                                canManageSettings &&
                                !isLastAdmin &&
                                member.invitationStatus === "Accepted"
                              ) {
                                setMemberToUpdate(member);
                                setSelectedRole(member.role);
                                openRoleModal();
                              }
                            }}
                            className={
                              canManageSettings &&
                              !isLastAdmin &&
                              member.invitationStatus === "Accepted"
                                ? "cursor-pointer hover:opacity-70 transition-opacity w-fit"
                                : "w-fit"
                            }
                          >
                            <Badge
                              color={getRoleColor(member.role)}
                              className="font-semibold text-[9px]  tracking-widest px-3"
                            >
                              <div className="flex items-center gap-1.5">
                                {translateRole(member.role)}
                                {canManageSettings &&
                                  !isLastAdmin &&
                                  member.invitationStatus === "Accepted" && (
                                    <PencilIcon className="size-3 opacity-50" />
                                  )}
                              </div>
                            </Badge>
                          </div>
                        </TableCell>

                        {/* Controls */}
                        <TableCell className="px-5 py-4 text-end whitespace-nowrap">
                          <div className="flex items-center justify-end gap-3 min-h-[28px]">
                            {isCurrentUser && !isLastAdmin && (
                              <button
                                onClick={openLeaveModal}
                                className="text-gray-400 hover:text-error-500 flex items-center gap-1 transition-colors"
                              >
                                <span className="text-[10px] font-semibold  tracking-widest">
                                  {t("modals.confirm_leave", {
                                    defaultValue: "Leave",
                                  })}
                                </span>
                                <HiOutlineLogout className="size-5" />
                              </button>
                            )}
                            {!isCurrentUser && canManageSettings && (
                              <button
                                onClick={() => {
                                  setMemberToDelete({
                                    id: member.id,
                                    name: member.name,
                                    status: member.invitationStatus,
                                  });
                                  openDeleteModal();
                                }}
                                className="text-gray-400 hover:text-error-500 transition-colors"
                              >
                                <TrashBinIcon className="size-5" />
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* --- ROLE UPDATE MODAL --- */}
      <Modal
        isOpen={isRoleOpen}
        onClose={closeRoleModal}
        className="max-w-[450px] m-4"
      >
        <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl text-center">
          <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineShieldCheck className="size-6 text-brand-500" />
          </div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white  tracking-tight mb-1">
            {t("list.columns.role")} {/* Reusing "Role" label */}
          </h4>
          <p className="text-[10px] text-gray-500 font-semibold  tracking-widest mb-6">
            {memberToUpdate?.name}
          </p>

          <div className="space-y-3 text-start">
            {["Admin", "Manager", "Deliver", "Viewer"].map((role) => (
              <label
                key={role}
                className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${selectedRole === role ? "border-brand-500 bg-brand-50 dark:bg-brand-500/20 ring-1 ring-brand-500" : "border-gray-100 dark:border-gray-800"}`}
              >
                <div className="flex flex-col text-left">
                  <span
                    className={`text-sm font-semibold  tracking-wide ${selectedRole === role ? "text-brand-600 dark:text-brand-400" : "text-gray-700 dark:text-gray-300"}`}
                  >
                    {translateRole(role)}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium leading-tight">
                    {/* Role Descriptions - Consider adding these to translation file later if needed */}
                    {role === "Admin"
                      ? "Full system control."
                      : role === "Manager"
                        ? "Manage items/billing."
                        : role === "Deliver"
                          ? "Routes & logistics."
                          : "Read-only access."}
                  </span>
                </div>
                <div
                  className={`w-2.5 h-2.5 rounded-full ${selectedRole === role ? "bg-brand-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" : "bg-gray-200 dark:bg-gray-700"}`}
                ></div>
                <input
                  type="radio"
                  className="hidden"
                  checked={selectedRole === role}
                  onChange={() => setSelectedRole(role)}
                />
              </label>
            ))}
          </div>

          <div className="flex gap-3 mt-8">
            <Button
              variant="outline"
              className="w-full text-[10px] font-semibold  tracking-widest"
              onClick={closeRoleModal}
            >
              {t("invite.cancel")}
            </Button>
            <Button
              className="w-full text-[10px] font-semibold  tracking-widest shadow-lg shadow-brand-500/20"
              onClick={handleConfirmRoleChange}
              disabled={updatingRole}
            >
              Update
            </Button>
          </div>
        </div>
      </Modal>

      {/* --- DESTRUCTIVE CONFIRMATIONS --- */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title={
          memberToDelete?.status === "Pending"
            ? t("modals.cancel_invite_title")
            : t("modals.remove_title")
        }
        description={t(
          memberToDelete?.status === "Pending"
            ? "modals.cancel_invite_desc"
            : "modals.remove_desc",
          { name: memberToDelete?.name, email: memberToDelete?.name },
        )}
        confirmText={
          memberToDelete?.status === "Pending"
            ? t("modals.confirm_cancel")
            : t("modals.confirm_remove")
        }
        variant="danger"
        isLoading={deleting}
      />

      <ConfirmModal
        isOpen={isLeaveOpen}
        onClose={closeLeaveModal}
        onConfirm={handleConfirmLeave}
        title={t("modals.leave_title", { defaultValue: "Leave Organization?" })}
        description={t("modals.leave_desc", {
          defaultValue: "You will lose access immediately.",
        })}
        confirmText={t("modals.confirm_leave", {
          defaultValue: "Confirm Leave",
        })}
        variant="danger"
        isLoading={leaving}
      />
    </>
  );
}