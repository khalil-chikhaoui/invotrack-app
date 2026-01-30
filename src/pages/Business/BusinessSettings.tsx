/**
 * @fileoverview BusinessSettings Component
 */

import { useEffect, useState } from "react";
import { useParams } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { businessApi, BusinessData } from "../../apis/business";
import CustomAlert from "../../components/common/CustomAlert";
import BusinessMetaCard from "../../components/BusinessProfile/BusinessMetaCard";
import BusinessAddressCard from "../../components/BusinessProfile/BusinessAddressCard";
import BusinessLegalCard from "../../components/BusinessProfile/BusinessLegalCard";
import LoadingState from "../../components/common/LoadingState"; // Integrated Loader
import { useAlert } from "../../hooks/useAlert";
import { usePermissions } from "../../hooks/usePermissions";
import PermissionDenied from "../../components/common/PermissionDenied";

export default function BusinessSettings() {
  const { businessId } = useParams();
  const { isAdmin } = usePermissions();

  // --- Data & Loading State ---
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const { alert, setAlert } = useAlert();

  /**
   * Synchronization Engine
   */
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

  // --- RENDERING LOGIC ---

  if (loading) {
    return (
      <LoadingState 
        message="Syncing Business Profile..." 
        minHeight="50vh" 
      />
    );
  }

  if (!isAdmin) {
    return (
      <PermissionDenied
        title="Configuration Locked"
        description="Your current membership role does not permit administrative modifications to this business registry."
        actionText="Return to Dashboard"
      />
    );
  }

  if (!businessData) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-error-500 font-bold uppercase tracking-[0.2em]">
        Registry Entry Not Found
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Settings | ${businessData.name}`}
        description="Business Management Console"
      />
      <PageBreadcrumb pageTitle="Business Configuration" />

      <CustomAlert data={alert} onClose={() => setAlert(null)} />

      <div className="space-y-6">
        {/* Identity & Visual Branding */}
        <BusinessMetaCard
          business={businessData}
          refresh={fetchBusiness}
          setAlert={setAlert}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
          {/* Geographic Location Registry */}
          <BusinessAddressCard
            business={businessData}
            refresh={fetchBusiness}
            setAlert={setAlert}
          />

          {/* Legal Identifiers & Tax Registry */}
          <BusinessLegalCard
            business={businessData}
            refresh={fetchBusiness}
            setAlert={setAlert}
          />
        </div>
      </div>
    </>
  );
}