/**
 * @fileoverview Subscription Page
 * Handles the SaaS billing lifecycle, including:
 * 1. Usage Tracking: Progress bar showing resource consumption.
 * 2. Tiered Pricing: Comparative layout for plan upgrades/downgrades.
 * 3. Payment Methods: Quick summary of the active credit card.
 * 4. Billing History: Tabular view of past transactions with document retrieval.
 * 5. Access Control: Restricted to Administrators.
 */

import { useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineCreditCard,
  HiOutlineDocumentText,
  HiOutlineSparkles,
} from "react-icons/hi2";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import PermissionDenied from "../../components/common/PermissionDenied";
import { usePermissions } from "../../hooks/usePermissions";

// --- Configuration Data ---
const PLANS = [
  {
    name: "Starter",
    price: "0",
    period: "/mo",
    features: [
      "5 Clients",
      "10 Invoices/mo",
      "Basic Analytics",
      "Email Support",
    ],
    current: false,
  },
  {
    name: "Pro",
    price: "29",
    period: "/mo",
    features: [
      "Unlimited Clients",
      "Unlimited Invoices",
      "Advanced Reports",
      "Priority Support",
      "Custom Branding",
    ],
    current: true, // Marker for the active subscription
    popular: true,
  },
  {
    name: "Enterprise",
    price: "99",
    period: "/mo",
    features: [
      "Dedicated Account Manager",
      "SSO & Audit Logs",
      "API Access",
      "Custom Contracts",
      "24/7 Phone Support",
    ],
    current: false,
  },
];

const INVOICES = [
  {
    id: "INV-001",
    date: "Oct 01, 2025",
    amount: "$29.00",
    status: "Paid",
    card: "Visa •••• 4242",
  },
  {
    id: "INV-002",
    date: "Sep 01, 2025",
    amount: "$29.00",
    status: "Paid",
    card: "Visa •••• 4242",
  },
  {
    id: "INV-003",
    date: "Aug 01, 2025",
    amount: "$29.00",
    status: "Paid",
    card: "Visa •••• 4242",
  },
];

export default function Subscription() {
  const { canManageSettings } = usePermissions(); //  Check Admin Permission
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");


  if (!canManageSettings) {
    return (
      <PermissionDenied 
        title="Subscription Management Restricted"
        description="Only Administrators can modify billing plans, payment methods, and view invoices."
        actionText="Return to Dashboard"
      />
    );
  }

  return (
    <>
      <PageMeta
        title="Subscription | Billing"
        description="Manage your plan and billing details"
      />
      <PageBreadcrumb pageTitle="Subscription & Billing" />

      <div className="space-y-8">
        {/* --- 1. CURRENT USAGE DASHBOARD --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Card: Uses brand colors to highlight active session */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-brand-600 p-8 text-white shadow-xl shadow-brand-500/20">
            {/* Ambient Background Decor */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-semibold uppercase tracking-widest backdrop-blur-md">
                    Pro Plan
                  </span>
                  <span className="text-xs font-medium text-brand-100 flex items-center gap-1">
                    <HiOutlineSparkles className="size-3" /> Active
                  </span>
                </div>
                <h2 className="text-3xl font-semibold uppercase tracking-tight mb-2">
                  Unlimited Access
                </h2>
                <p className="text-brand-100 text-sm max-w-md">
                  Your next billing date is{" "}
                  <span className="font-semibold text-white">Nov 01, 2025</span> for{" "}
                  <span className="font-semibold text-white">$29.00</span>.
                </p>
              </div>

              {/* Resource Meter: Visualizing consumption against limits */}
              <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl min-w-[200px]">
                <div className="flex justify-between text-xs font-semibold uppercase tracking-widest mb-2 opacity-80">
                  <span>Resource Usage</span>
                  <span>78%</span>
                </div>
                <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[78%] rounded-full transition-all duration-1000"></div>
                </div>
                <p className="text-[10px] mt-2 opacity-70">
                  78 / 100 API Calls Used (Soft Limit)
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/[0.05] p-8 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <HiOutlineCreditCard className="size-4 text-brand-500" />{" "}
                Payment Registry
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center border border-gray-200 dark:border-gray-700">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                    alt="Visa"
                    className="h-3 opacity-70 grayscale"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Visa ending in 4242
                  </p>
                  <p className="text-xs text-gray-500">Expiry 12/28</p>
                </div>
              </div>
            </div>
            <Button 
              variant="outline"
              className="w-full text-[10px] font-semibold uppercase tracking-widest"
            >
              Update Payment Method
            </Button>
          </div>
        </div>

        {/* --- 2. PLANS COMPARISON --- */}
        <div>
          <div className="flex flex-col md:flex-row justify-between items-end mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white uppercase tracking-tight leading-none">
              Available Plans
            </h3>

            {/* Frequency Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mt-4 md:mt-0 shadow-inner">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${billingCycle === "monthly" ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${billingCycle === "yearly" ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
              >
                Yearly{" "}
                <span className="text-brand-500 text-[9px] ml-1">-20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-6 rounded-3xl border transition-all duration-300 ${
                  plan.current
                    ? "bg-white dark:bg-gray-900 border-brand-500 ring-4 ring-brand-500/10 shadow-2xl scale-[1.02] z-10"
                    : "bg-white dark:bg-white/[0.02] border-gray-200 dark:border-white/[0.05] hover:border-brand-200 dark:hover:border-white/10"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-brand-500 text-white text-[9px] font-semibold uppercase tracking-widest px-3 py-1 rounded-bl-xl rounded-tr-2xl shadow-lg shadow-brand-500/20">
                    Most Popular
                  </div>
                )}

                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  {plan.name}
                </h4>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-semibold text-gray-900 dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-gray-400 text-sm font-medium">
                    {plan.period}
                  </span>
                </div>

                <div className="space-y-3 mb-8 border-t border-gray-50 dark:border-white/5 pt-6">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <HiOutlineCheckCircle className="size-5 text-brand-500 shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  variant={plan.current ? "primary" : "outline"}
                  className="w-full text-[10px] font-semibold uppercase tracking-widest py-3 shadow-sm"
                  disabled={plan.current}
                >
                  {plan.current ? "Active Plan" : "Upgrade Plan"}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* --- 3. BILLING HISTORY --- */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/[0.05] rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/30 dark:bg-transparent">
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <HiOutlineDocumentText className="size-4 text-brand-500" />{" "}
              Financial Registry
            </h3>
            <button className="text-[10px] font-semibold text-brand-500 uppercase hover:underline tracking-widest">
              Bulk Download (ZIP)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/[0.02] text-[9px] font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/5">
                  <th className="px-6 py-4">Reference ID</th>
                  <th className="px-6 py-4">Transaction Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {INVOICES.map((inv) => (
                  <tr
                    key={inv.id}
                    className="text-sm hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors group"
                  >
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white uppercase tracking-tighter">
                      {inv.id}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {inv.date}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-900 dark:text-white font-semibold">
                      {inv.amount}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        color="success"
                        className="text-[10px] uppercase font-semibold px-2 py-0.5 tracking-widest"
                      >
                        Paid
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="text-gray-400 hover:text-brand-500 transition-colors"
                        title="Download PDF"
                      >
                        <HiOutlineDocumentText className="size-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}