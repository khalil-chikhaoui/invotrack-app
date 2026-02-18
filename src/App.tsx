/**
 * @fileoverview Main Application Entry Point
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { ScrollToTop } from "./components/common/ScrollToTop";

// --- IMPORTS ---
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import AcceptInvitation from "./pages/AuthPages/AcceptInvitation";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import NewPassword from "./pages/AuthPages/NewPassword";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import PublicRoute from "./hooks/route/PublicRoute";
import BusinessGuard from "./hooks/route/BusinessGuard";
import ProtectedRoute from "./hooks/route/ProtectedRoute";
import Home from "./pages/Dashboard/Home";
import UserProfiles from "./pages/Profile/UserProfiles";
import AddMember from "./pages/Business/AddMember";
import SelectBusiness from "./pages/AuthPages/SelectBusiness";
import BusinessSettings from "./pages/Business/BusinessSettings";
import Members from "./pages/Business/Members";
import CreateBusiness from "./pages/Business/CreateBusiness";
import BusinessCurrency from "./pages/Business/BusinessCurrency";
import BusinessTaxDiscount from "./pages/Business/BusinessTaxDiscount";
import InvoiceSettings from "./pages/Business/InvoiceSettings";
import Subscription from "./pages/Business/Subscription";
import Clients from "./pages/Clients/Clients";
import ClientDetails from "./pages/Clients/ClientDetails";
import Items from "./pages/Items/Items";
import ItemDetails from "./pages/Items/ItemDetails";
import Invoices from "./pages/Invoices/Invoices";
import CreateInvoice from "./pages/Invoices/CreateInvoice";
import InvoiceDetails from "./pages/Invoices/InvoiceDetails";
import Calendar from "./pages/Calendar/Calendar";
import VerifyEmail from "./pages/AuthPages/VerifyEmail";
import PublicInvoiceViewer from "./pages/Invoices/PublicInvoiceViewer";
import CreateDeliveryNote from "./pages/Delivery/CreateDeliveryNote";
import DeliveryHistory from "./pages/Delivery/DeliveryHistory";
import PublicDeliveryNoteViewer from "./pages/Delivery/PublicDeliveryNoteViewer";
import DeliveryDetails from "./pages/Delivery/DeliveryDetails";

// --- GLOBAL BACKGROUND COMPONENT ---
// This sits behind the entire app
const GlobalBackground = () => (
  <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-white dark:bg-[#0B1120] transition-colors duration-500">
    {/* Top Right Blob */}
    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-500/10 dark:bg-brand-500/20 rounded-full blur-[100px] opacity-70 animate-pulse" />
    {/* Bottom Left Blob */}
    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/10 dark:bg-indigo-500/10 rounded-full blur-[120px] opacity-70" />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        {/* 1. Global Background (Fixed position, behind everything) */}
        <GlobalBackground />

        {/* Ensures navigation resets scroll position to top */}
        <ScrollToTop />

        <Routes>
          {/* --- 1. PUBLIC ROUTES --- */}
          <Route path="/invoice/:id/view" element={<PublicInvoiceViewer />} />
          <Route path="/delivery/:id/view" element={<PublicDeliveryNoteViewer />} />


            {/* --- 2. ROUTES FOR NOT LOGGED IN USERS--- */}
          <Route element={<PublicRoute />}>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/:token" element={<NewPassword />} />
          </Route>

          {/* --- 3. HYBRID/INVITATION ROUTE --- */}
          <Route
            path="/accept-invitation/:token"
            element={<AcceptInvitation />}
          />

          {/* --- 3. PROTECTED ROUTES --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/select-business" element={<SelectBusiness />} />
            <Route path="/create-business" element={<CreateBusiness />} />

            <Route element={<BusinessGuard />}>
              <Route path="/business/:businessId" element={<AppLayout />}>
                <Route index element={<Home />} />
                <Route path="clients" element={<Clients />} />
                <Route path="clients/:id" element={<ClientDetails />} />
                <Route path="items" element={<Items />} />
                <Route path="items/:id" element={<ItemDetails />} />
                <Route path="invoices">
                  <Route index element={<Invoices />} />
                  <Route path="create" element={<CreateInvoice />} />
                  <Route path=":id" element={<InvoiceDetails />} />
                </Route>
                <Route path="settings" element={<BusinessSettings />} />
                <Route path="currency" element={<BusinessCurrency />} />
                <Route path="templates" element={<InvoiceSettings />} />
                <Route path="subscription" element={<Subscription />} />
                <Route path="taxes" element={<BusinessTaxDiscount />} />
                <Route path="members" element={<Members />} />
                <Route path="add-member" element={<AddMember />} />
                <Route path="profile" element={<UserProfiles />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="delivery">
                  <Route index element={<DeliveryHistory />} />
                  <Route path="create" element={<CreateDeliveryNote />} />
                  <Route path=":id" element={<DeliveryDetails />} />
                </Route>
              </Route>
            </Route>

            <Route
              path="/"
              element={<Navigate to="/select-business" replace />}
            />
          </Route>

          {/* --- 4. 404 CATCH-ALL --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
