/**
 * @fileoverview BusinessSettings Component
 */

import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { businessApi, BusinessData } from "../../apis/business";
import CustomAlert from "../../components/common/CustomAlert";
import BusinessMetaCard from "../../components/BusinessProfile/BusinessMetaCard";
import BusinessAddressCard from "../../components/BusinessProfile/BusinessAddressCard";
import BusinessLegalCard from "../../components/BusinessProfile/BusinessLegalCard";
import LoadingState from "../../components/common/LoadingState";
import { useAlert } from "../../hooks/useAlert";
import { usePermissions } from "../../hooks/usePermissions";
import PermissionDenied from "../../components/common/PermissionDenied";
import { scrollToTopAppLayout } from "../../layout/AppLayout";

export default function BusinessSettings() {
  const { t } = useTranslation("business");
  const { businessId } = useParams();
  const { isAdmin } = usePermissions();

  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const { alert, setAlert } = useAlert();

  const triggerAlert = (data: {
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }) => {
    setAlert(data);
    scrollToTopAppLayout();
  };

  const fetchBusiness = async () => {
    if (!businessId) return;
    try {
      const data = await businessApi.getBusiness(businessId);
      setBusinessData(data);
    } catch (error) {
      console.error("Critical Sync Failure:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchBusiness();
    } else {
      setLoading(false);
    }
  }, [businessId, isAdmin]);

  if (loading) {
    return (
      <LoadingState message={t("settings.general.loading")} minHeight="50vh" />
    );
  }

  if (!isAdmin) {
    return (
      <PermissionDenied
        title={t("settings.general.locked_title")}
        description={t("settings.general.locked_desc")}
        actionText={t("create.nav.back")}
      />
    );
  }

  if (!businessData) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-error-500 font-semibold uppercase tracking-[0.2em]">
        {t("settings.general.not_found")}
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${t("settings.general.title")} | ${businessData.name}`}
        description={t("settings.general.description")}
      />
      <PageBreadcrumb pageTitle={t("settings.general.title")} />

      <CustomAlert data={alert} onClose={() => setAlert(null)} />

      <div className="space-y-4">
        <BusinessMetaCard
          business={businessData}
          refresh={fetchBusiness}
          setAlert={triggerAlert}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 items-start">
          <BusinessAddressCard
            business={businessData}
            refresh={fetchBusiness}
            setAlert={triggerAlert}
          />

          <BusinessLegalCard
            business={businessData}
            refresh={fetchBusiness}
            setAlert={triggerAlert}
          />
        </div>
      </div>
    </>
  );
}
