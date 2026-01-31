/**
 * @fileoverview Main Application Entry Point
 * Orchestrates global providers, high-level routing, and security guards.
 * Implements a tri-level routing strategy: Public, Protected, and Business-Context.
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { ScrollToTop } from "./components/common/ScrollToTop";

// --- AUTH & PUBLIC PAGES ---
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import AcceptInvitation from "./pages/AuthPages/AcceptInvitation";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import NewPassword from "./pages/AuthPages/NewPassword";
import NotFound from "./pages/OtherPage/NotFound";

// --- LAYOUTS & GUARDS --- 
import AppLayout from "./layout/AppLayout";
import PublicRoute from "./components/route/PublicRoute";
import BusinessGuard from "./components/route/BusinessGuard";
import ProtectedRoute from "./components/route/ProtectedRoute";

// --- DASHBOARD & BUSINESS PAGES ---
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

// --- CORE MODULES (CRM, INVENTORY, BILLING) ---
import Clients from "./pages/Clients/Clients";
import ClientDetails from "./pages/Clients/ClientDetails";
import Items from "./pages/Items/Items";
import ItemDetails from "./pages/Items/ItemDetails";
import Invoices from "./pages/Invoices/Invoices";
import CreateInvoice from "./pages/Invoices/CreateInvoice";
import InvoiceDetails from "./pages/Invoices/InvoiceDetails";

// --- UI & UTILS ---
import FormElements from "./pages/Forms/FormElements";
import Calendar from "./pages/Calendar";
import VerifyEmail from "./pages/AuthPages/VerifyEmail";



export default function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Ensures navigation resets scroll position to top */}
        <ScrollToTop />

        <Routes>
          {/* --- 1. PUBLIC ROUTES --- 
              Accessible only when the user is NOT logged in.
          */}
          <Route element={<PublicRoute />}>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/:token" element={<NewPassword />} />
          </Route>

          {/* --- 2. HYBRID/INVITATION ROUTE --- 
              Handles token validation; logic inside decides if user needs to login or register.
          */}
          <Route
            path="/accept-invitation/:token"
            element={<AcceptInvitation />}
          />

          {/* --- 3. PROTECTED ROUTES --- 
              Requires a valid JWT. Redirects to /signin if unauthenticated.
          */}
          <Route element={<ProtectedRoute />}>
            {/* Phase A: User is authenticated but hasn't entered a business workspace yet */}
            <Route path="/select-business" element={<SelectBusiness />} />
            <Route path="/create-business" element={<CreateBusiness />} />

            {/* Phase B: Business Context Active 
                Requires a valid :businessId in the URL that the user has permission to access.
            */}
            <Route element={<BusinessGuard />}>
              <Route path="/business/:businessId" element={<AppLayout />}>
                {/* Workspace Dashboard */}
                <Route index element={<Home />} />

                {/* CRM Module */}
                <Route path="clients" element={<Clients />} />
                <Route path="clients/:id" element={<ClientDetails />} />

                {/* Inventory Module */}
                <Route path="items" element={<Items />} />
                <Route path="items/:id" element={<ItemDetails />} />

                {/* Billing & Invoices Module */}
                <Route path="invoices">
                  <Route index element={<Invoices />} />
                  <Route path="create" element={<CreateInvoice />} />
                  <Route path=":id" element={<InvoiceDetails />} />
                </Route>

                {/* Business Configuration & Management */}
                <Route path="settings" element={<BusinessSettings />} />
                <Route path="currency" element={<BusinessCurrency />} />
                <Route path="templates" element={<InvoiceSettings />} />
                <Route path="subscription" element={<Subscription />} />
                <Route path="taxes" element={<BusinessTaxDiscount />} />
                <Route path="members" element={<Members />} />
                <Route path="add-member" element={<AddMember />} />

                {/* Personal Settings within Business Context */}
                <Route path="profile" element={<UserProfiles />} />
                <Route path="calendar" element={<Calendar />} />
              </Route>
            </Route>

            {/* Root Fallback: Redirect authenticated users to business selection */}
            <Route
              path="/"
              element={<Navigate to="/select-business" replace />}
            />
          </Route>

          {/* Development / Utility Routes */}
          <Route path="forms" element={<FormElements />} />

          {/* --- 4. 404 CATCH-ALL --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
