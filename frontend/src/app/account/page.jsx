"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { notifyCustomerAuthChanged } from "@/utils/storefrontSync";
import { StorefrontPrice } from "@/context/StorefrontPreferencesContext";

import CustomerLoginModal from "../../components/CustomerLoginModal";

import {
  UserRound,
  Package,
  MapPin,
  LogOut,
  Pencil,
  ArrowRight,
  Check,
  ChevronRight,
  Save,
  X,
} from "lucide-react";

const COLORS = {
  teal: "#295C65",
  cream: "#FAF8F5",
  darkCream: "#F2EEE9",
  gold: "#BE9D6B",
  navGray: "#696968",
  white: "#FFFFFF",
  ink: "#1A1A1A",
};
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api"
).replace(
  /\/$/,
  ""
);



const INITIAL_PROFILE = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

function AccountPageLoader() {
  return (
    <main style={{ minHeight: "60vh", background: "#FAF8F5", padding: "40px 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ height: 22, width: "35%", background: "#e8dfd3", borderRadius: 999, marginBottom: 24 }} />
        <div style={{ height: 220, borderRadius: 22, background: "#f3efe9", border: "1px solid #e9e0d4" }} />
      </div>
    </main>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountPageLoader />}>
      <AccountPageContent />
    </Suspense>
  );
}

function AccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (["profile", "orders", "addresses"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("tab") === "addresses") {
      const timer = window.setTimeout(() => {
        document.getElementById("account-addresses")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 80);
      return () => window.clearTimeout(timer);
    }
  }, [searchParams]);

  const [activeTab, setActiveTab] =
    useState(() => {
      const tab = searchParams.get("tab");
      return ["profile", "orders", "addresses"].includes(tab)
        ? tab
        : "profile";
    });

  const [customer, setCustomer] =
    useState(null);

  const [authChecked, setAuthChecked] =
    useState(false);

  const [loginPopupOpen, setLoginPopupOpen] =
    useState(false);

  const [profile, setProfile] =
    useState(INITIAL_PROFILE);

  const [editProfile, setEditProfile] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [address, setAddress] =
    useState({
      name: "Bhargav Sinha",
      line1: "123, Green Park",
      line2: "Mansarovar, Jaipur - 302020",
      line3: "Rajasthan, India",
      phone: "+91 98765 43210",
    });

  const [editAddress, setEditAddress] =
    useState(false);

  const [addressSaved, setAddressSaved] =
    useState(false);

  const [profileErrors, setProfileErrors] =
    useState({});
  const [userOrders, setUserOrders] =
    useState([]);
  const [ordersLoading, setOrdersLoading] =
    useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] =
    useState(null);
  const [showCancelModal, setShowCancelModal] =
    useState(false);
  const [cancelReason, setCancelReason] =
    useState("");
  const [cancelProcessing, setCancelProcessing] =
    useState(false);

    useEffect(() => {
  let mounted = true;

  async function loadCustomer() {
    try {
      const response =
        await fetch(
          `${API_URL}/customer-auth/me`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

      if (!response.ok) {
        if (mounted) {
          setCustomer(null);
          setAuthChecked(true);
          setLoginPopupOpen(true);
        }

        return;
      }

      const payload =
        await response.json();

      const user =
        payload?.user || null;

      if (!mounted) {
        return;
      }

      if (!user) {
        setCustomer(null);
        setAuthChecked(true);
        setLoginPopupOpen(true);
        return;
      }

      setCustomer(user);

      /*
       * Backend ke live customer data ko
       * existing profile UI mein map kar rahe hain.
       */
      const fullName =
        String(
          user.name || ""
        ).trim();

      const nameParts =
        fullName
          ? fullName.split(/\s+/)
          : [];

      const firstName =
        nameParts.shift() || "";

      const lastName =
        nameParts.join(" ");

      setProfile({
        firstName,
        lastName,
        email:
          user.email || "",
        phone:
          user.phone || "",
      });

      setAuthChecked(true);
    } catch (error) {
      if (mounted) {
        setCustomer(null);
        setAuthChecked(true);
        setLoginPopupOpen(true);
      }
    }
  }

  loadCustomer();

  return () => {
    mounted = false;
  };
}, []);

  // Fetch user orders
  useEffect(() => {
    if (!customer) return;
    fetchUserOrders();
  }, [customer]);

  const fetchUserOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await fetch(`${API_URL}/orders?page=1&limit=5`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setUserOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrderForCancel) return;
    setCancelProcessing(true);
    try {
      const res = await fetch(`${API_URL}/orders/${selectedOrderForCancel._id}/request-cancellation`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason || "No reason provided" }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCancelModal(false);
        setCancelReason("");
        setSelectedOrderForCancel(null);
        fetchUserOrders(); // Refresh orders
        alert("Cancellation request submitted!");
      } else {
        alert(data.message || "Failed to cancel order");
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert("Error cancelling order");
    } finally {
      setCancelProcessing(false);
    }
  };
  /* =====================================================
     PROFILE
  ===================================================== */

  const updateProfile = (field, value) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveProfile = () => {
    const errors = {};

    if (!profile.firstName.trim()) {
      errors.firstName =
        "First name is required.";
    }

    if (!profile.lastName.trim()) {
      errors.lastName =
        "Last name is required.";
    }

    if (!profile.email.trim()) {
      errors.email =
        "Email address is required.";
    }

    if (!profile.phone.trim()) {
      errors.phone =
        "Phone number is required.";
    }

    setProfileErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setEditProfile(false);
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 1800);
  };

  /* =====================================================
     ADDRESS
  ===================================================== */

  const updateAddress = (
    field,
    value
  ) => {
    setAddress((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveAddress = () => {
    setEditAddress(false);
    setAddressSaved(true);

    window.setTimeout(() => {
      setAddressSaved(false);
    }, 1800);
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout =
  async () => {
    try {
      await fetch(
        `${API_URL}/customer-auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    } finally {
      notifyCustomerAuthChanged();
      setCustomer(null);
      router.replace("/");
      router.refresh();
    }
  };
  if (!authChecked) {
  return null;
}

if (!customer) {
  return (
    <CustomerLoginModal
      open={true}
      onClose={() => {
        router.replace("/");
      }}
      onSuccess={(user) => {
        setCustomer(user);
        setLoginPopupOpen(false);

        const fullName =
          String(
            user?.name || ""
          ).trim();

        const parts =
          fullName
            ? fullName.split(/\s+/)
            : [];

        setProfile({
          firstName:
            parts.shift() || "",
          lastName:
            parts.join(" "),
          email:
            user?.email || "",
          phone:
            user?.phone || "",
        });

        // Check if there's a redirect URL
        if (redirectUrl) {
          router.replace(redirectUrl);
        } else {
          router.replace("/");
        }
        router.refresh();
      }}
    />
  );
}

  return (
    <main className="account-page">

      <style>{`

        /* =====================================================
           PAGE
        ===================================================== */

        .account-page {
          width: 100%;
          min-height: 100vh;

          background:
            ${COLORS.cream};

          color:
            ${COLORS.ink};

          padding:
            42px 0 70px;

          box-sizing:
            border-box;

          overflow-x:
            hidden;
        }


        /* =====================================================
           MAIN CONTAINER
        ===================================================== */

        .account-container {
          width: 100%;
          max-width: 1400px;

          margin:
            0 auto;

          padding:
            0 32px;

          box-sizing:
            border-box;
        }


        /* =====================================================
           HEADER
        ===================================================== */

        .account-header {
          width:
            100%;

          max-width:
            820px;

          margin:
            0 auto 28px;

          text-align:
            left;
        }


        .account-title {
          margin:
            0 0 7px;

          color:
            ${COLORS.teal};

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size:
            40px;

          font-weight:
            500;

          line-height:
            1;
        }


        .account-subtitle {
          margin:
            0;

          color:
            ${COLORS.navGray};

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            13px;

          line-height:
            1.5;
        }


        /* =====================================================
           MAIN LAYOUT
        ===================================================== */

        .account-layout {
          width:
            100%;

          display:
            grid;

          grid-template-columns:
            240px
            minmax(
              0,
              1fr
            );

          gap:
            28px;

          align-items:
            start;
        }


        /* =====================================================
           SIDEBAR
        ===================================================== */

        .account-sidebar {
          width:
            100%;

          display:
            flex;

          flex-direction:
            column;

          gap:
            5px;
        }


        .account-nav-button {
          width:
            100%;

          min-height:
            54px;

          display:
            flex;

          align-items:
            center;

          gap:
            15px;

          padding:
            0 18px;

          border:
            none;

          border-left:
            3px solid
            transparent;

          border-radius:
            4px;

          background:
            transparent;

          color:
            ${COLORS.navGray};

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            13px;

          font-weight:
            500;

          text-align:
            left;

          cursor:
            pointer;

          transition:
            background .2s ease,
            color .2s ease,
            border-color .2s ease;
        }


        .account-nav-button:hover {
          background:
            rgba(
              41,
              92,
              101,
              .05
            );

          color:
            ${COLORS.teal};
        }


        .account-nav-button.active {
          background:
            #E7EFED;

          color:
            ${COLORS.teal};

          border-left-color:
            ${COLORS.teal};

          font-weight:
            600;
        }


        .account-nav-icon {
          width:
            22px;

          height:
            22px;

          flex-shrink:
            0;
        }


        /* =====================================================
           RIGHT CONTENT
        ===================================================== */

        .account-content {
          width:
            100%;

          min-width:
            0;

          display:
            flex;

          flex-direction:
            column;

          gap:
            18px;
        }


        /* =====================================================
           COMMON CARD
        ===================================================== */

        .account-card {
          width:
            100%;

          background:
            ${COLORS.white};

          border:
            1px solid
            #E8E1DA;

          border-radius:
            8px;

          padding:
            18px 24px;

          box-sizing:
            border-box;
        }


        /* =====================================================
           CARD HEADER
        ===================================================== */

        .account-card-header {
          width:
            100%;

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            15px;

          margin-bottom:
            18px;
        }


        .account-card-title {
          margin:
            0;

          color:
            #173C46;

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size:
            22px;

          font-weight:
            500;

          line-height:
            1;
        }


        .account-edit-button,
        .account-view-button {
          border:
            none;

          background:
            transparent;

          color:
            ${COLORS.teal};

          display:
            inline-flex;

          align-items:
            center;

          gap:
            6px;

          padding:
            4px;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            11px;

          font-weight:
            600;

          cursor:
            pointer;

          text-decoration:
            none;
        }


        .account-edit-button:hover,
        .account-view-button:hover {
          color:
            ${COLORS.gold};
        }


        /* =====================================================
           PROFILE GRID
        ===================================================== */

        .profile-grid {
          width:
            100%;

          display:
            grid;

          grid-template-columns:
            1fr 1fr;

          gap:
            16px 22px;
        }


        .profile-field {
          width:
            100%;
        }


        .profile-field.full {
          grid-column:
            1 / -1;
        }


        .profile-label {
          display:
            block;

          margin:
            0 0 7px;

          color:
            #666E70;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            11px;

          font-weight:
            500;
        }


        .profile-input {
          width:
            100%;

          height:
            43px;

          border:
            1px solid
            #E1D9D1;

          border-radius:
            7px;

          padding:
            0 12px;

          box-sizing:
            border-box;

          background:
            #FFFFFF;

          color:
            #1D2E33;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            12px;

          outline:
            none;
        }


        .profile-input:focus {
          border-color:
            ${COLORS.teal};

          box-shadow:
            0 0 0 2px
            rgba(
              41,
              92,
              101,
              .08
            );
        }


        .profile-input.readonly {
          background:
            #FCFAF8;

          color:
            #27373C;

          cursor:
            default;
        }


        .profile-error {
          display:
            block;

          margin-top:
            4px;

          color:
            #A64C40;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            9px;
        }


        /* =====================================================
           PROFILE SAVE
        ===================================================== */

        .profile-save-wrap {
          margin-top:
            16px;
        }


        .profile-save-button {
          min-width:
            180px;

          height:
            42px;

          border:
            1px solid
            ${COLORS.teal};

          border-radius:
            999px;

          background:
            ${COLORS.teal};

          color:
            #FFFFFF;

          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            7px;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            11px;

          font-weight:
            600;

          cursor:
            pointer;

          transition:
            background .2s ease;
        }


        .profile-save-button:hover {
          background:
            #214D55;
        }


        .profile-save-button.saved {
          background:
            ${COLORS.gold};

          border-color:
            ${COLORS.gold};
        }


        /* =====================================================
           ADDRESS
        ===================================================== */

        .account-address-box {
          width:
            100%;

          min-height:
            115px;

          display:
            flex;

          align-items:
            center;

          gap:
            16px;

          padding:
            15px;

          background:
            #FCFAF8;

          border:
            1px solid
            #ECE5DE;

          border-radius:
            7px;

          box-sizing:
            border-box;
        }


        .address-icon {
          width:
            47px;

          height:
            47px;

          flex-shrink:
            0;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            50%;

          background:
            #EAF0EE;

          color:
            ${COLORS.teal};
        }


        .address-info {
          min-width:
            0;

          display:
            flex;

          flex-direction:
            column;

          gap:
            3px;
        }


        .address-name {
          color:
            #1E3138;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            12px;

          font-weight:
            600;
        }


        .address-line {
          color:
            ${COLORS.navGray};

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            11px;

          line-height:
            1.35;
        }


        .address-edit-wrap {
          margin-top:
            13px;

          display:
            flex;

          justify-content:
            flex-end;

          gap:
            10px;
        }


        /* =====================================================
           ADDRESS EDIT
        ===================================================== */

        .address-input-grid {
          width:
            100%;

          display:
            grid;

          grid-template-columns:
            1fr 1fr;

          gap:
            10px;
        }


        .address-input {
          width:
            100%;

          height:
            38px;

          border:
            1px solid
            #E1D9D1;

          border-radius:
            7px;

          background:
            #FFFFFF;

          color:
            #1A2E34;

          padding:
            0 10px;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            10px;

          box-sizing:
            border-box;

          outline:
            none;
        }


        .address-input.full {
          grid-column:
            1 / -1;
        }


        .address-input:focus {
          border-color:
            ${COLORS.teal};
        }


        .address-save {
          min-width:
            125px;

          height:
            37px;

          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            6px;

          border:
            1px solid
            ${COLORS.teal};

          border-radius:
            999px;

          background:
            ${COLORS.teal};

          color:
            #FFFFFF;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            10px;

          font-weight:
            600;

          cursor:
            pointer;
        }


        .address-save.saved {
          background:
            ${COLORS.gold};

          border-color:
            ${COLORS.gold};
        }


        .address-cancel {
          min-width:
            80px;

          height:
            37px;

          border:
            1px solid
            #D9D0C7;

          border-radius:
            999px;

          background:
            #FFFFFF;

          color:
            ${COLORS.navGray};

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            10px;

          font-weight:
            500;

          cursor:
            pointer;
        }


        /* =====================================================
           ORDERS
        ===================================================== */

        .orders-list {
          width:
            100%;

          display:
            flex;

          flex-direction:
            column;
        }


        .order-row {
          width:
            100%;

          min-height:
            73px;

          display:
            grid;

          grid-template-columns:
            68px
            minmax(
              150px,
              1fr
            )
            110px
            22px;

          align-items:
            center;

          gap:
            14px;

          border-top:
            1px solid
            #ECE6DF;
        }


        .order-row:first-child {
          border-top:
            none;
        }


        .order-image {
          width:
            62px;

          height:
            56px;

          overflow:
            hidden;

          border-radius:
            6px;

          background:
            ${COLORS.darkCream};
        }


        .order-image img {
          width:
            100%;

          height:
            100%;

          display:
            block;

          object-fit:
            cover;
        }


        .order-info {
          min-width:
            0;

          display:
            flex;

          flex-direction:
            column;

          gap:
            2px;
        }


        .order-id {
          color:
            #243A41;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            11px;

          font-weight:
            600;
        }


        .order-meta {
          color:
            ${COLORS.navGray};

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            9px;

          line-height:
            1.35;
        }


        .order-status {
          justify-self:
            center;

          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          min-width:
            78px;

          height:
            29px;

          padding:
            0 10px;

          border-radius:
            999px;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            9px;

          font-weight:
            600;
        }


        .order-status.delivered {
          background:
            #DDF3E3;

          color:
            #2B8750;
        }


        .order-status.shipped {
          background:
            #DDEFF7;

          color:
            #297495;
        }


        .order-arrow {
          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          color:
            ${COLORS.teal};
        }


        /* =====================================================
           ORDER DETAIL LINK
        ===================================================== */

        .order-clickable {
          text-decoration:
            none;
        }


        /* =====================================================
           ORDERS VIEW ALL
        ===================================================== */

        .account-view-all {
          display:
            inline-flex;

          align-items:
            center;

          gap:
            5px;

          color:
            ${COLORS.teal};

          text-decoration:
            none;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            10px;

          font-weight:
            600;
        }

        /* =====================================================
           CANCEL MODAL
        ===================================================== */

        .cancel-modal-overlay {
          position:
            fixed;

          top:
            0;

          left:
            0;

          right:
            0;

          bottom:
            0;

          background:
            rgba(0, 0, 0, 0.5);

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          z-index:
            1000;

          padding:
            20px;

          box-sizing:
            border-box;
        }

        .cancel-modal {
          background:
            ${COLORS.white};

          border-radius:
            8px;

          padding:
            24px;

          max-width:
            400px;

          width:
            100%;

          box-shadow:
            0 4px 12px
            rgba(0, 0, 0, 0.15);
        }

        .cancel-modal-header {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          margin-bottom:
            16px;
        }

        .cancel-modal-title {
          margin:
            0;

          color:
            #173C46;

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size:
            20px;

          font-weight:
            500;
        }

        .cancel-modal-close {
          background:
            none;

          border:
            none;

          color:
            ${COLORS.navGray};

          cursor:
            pointer;

          padding:
            0;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;
        }

        .cancel-modal-body {
          margin-bottom:
            20px;
        }

        .cancel-modal-label {
          display:
            block;

          margin-bottom:
            8px;

          color:
            #666E70;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            11px;

          font-weight:
            500;
        }

        .cancel-modal-textarea {
          width:
            100%;

          height:
            80px;

          padding:
            10px;

          border:
            1px solid
            #E1D9D1;

          border-radius:
            7px;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            11px;

          resize:
            vertical;

          box-sizing:
            border-box;

          outline:
            none;
        }

        .cancel-modal-textarea:focus {
          border-color:
            ${COLORS.teal};

          box-shadow:
            0 0 0 2px
            rgba(
              41,
              92,
              101,
              .08
            );
        }

        .cancel-modal-footer {
          display:
            flex;

          gap:
            10px;

          justify-content:
            flex-end;
        }

        .cancel-modal-button {
          min-width:
            100px;

          height:
            38px;

          border-radius:
            999px;

          border:
            1px solid;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            11px;

          font-weight:
            600;

          cursor:
            pointer;

          transition:
            background .2s ease;
        }

        .cancel-modal-button.confirm {
          background:
            #A64C40;

          color:
            #FFFFFF;

          border-color:
            #A64C40;
        }

        .cancel-modal-button.confirm:hover {
          background:
            #8B3D33;

          border-color:
            #8B3D33;
        }

        .cancel-modal-button.cancel {
          background:
            #FFFFFF;

          color:
            ${COLORS.navGray};

          border-color:
            #D9D0C7;
        }

        .cancel-modal-button.cancel:hover {
          background:
            #F9F7F4;
        }



        /* =====================================================
           ORDERS TAB
        ===================================================== */

        .orders-tab-list {
          width:
            100%;

          display:
            flex;

          flex-direction:
            column;
        }


        .orders-tab-item {
          width:
            100%;

          display:
            grid;

          grid-template-columns:
            80px
            minmax(
              0,
              1fr
            )
            100px;

          align-items:
            center;

          gap:
            15px;

          min-height:
            86px;

          border-bottom:
            1px solid
            #ECE6DF;
        }


        .orders-tab-image {
          width:
            72px;

          height:
            62px;

          border-radius:
            7px;

          overflow:
            hidden;
        }


        .orders-tab-image img {
          width:
            100%;

          height:
            100%;

          object-fit:
            cover;
        }


        .orders-tab-info strong {
          display:
            block;

          color:
            #233A41;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            12px;

          margin-bottom:
            3px;
        }


        .orders-tab-info span {
          display:
            block;

          color:
            ${COLORS.navGray};

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            10px;

          line-height:
            1.5;
        }


        /* =====================================================
           MOBILE NAV
        ===================================================== */

        .mobile-account-nav {
          display:
            none;
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 800px) {

          .account-page {
            padding:
              30px 0 45px;
          }


          .account-container {
            width:
              100%;

            max-width:
              100%;

            margin:
              0;

            padding:
              0 16px;
          }


          .account-header {
            margin:
              0 0 20px;
          }


          .account-title {
            font-size:
              39px;
          }


          .account-subtitle {
            font-size:
              10px;
          }


          .account-layout {
            display:
              flex;

            flex-direction:
              column;

            gap:
              16px;
          }


          .account-sidebar {
            display:
              none;
          }


          .mobile-account-nav {
            width:
              100%;

            display:
              flex;

            gap:
              7px;

            overflow-x:
              auto;

            padding-bottom:
              2px;

            scrollbar-width:
              none;
          }


          .mobile-account-nav::-webkit-scrollbar {
            display:
              none;
          }


          .mobile-account-nav-button {
            flex:
              0 0 auto;

            min-height:
              35px;

            display:
              inline-flex;

            align-items:
              center;

            justify-content:
              center;

            gap:
              6px;

            padding:
              0 12px;

            border:
              1px solid
              #E2DBD4;

            border-radius:
              999px;

            background:
              #FFFFFF;

            color:
              ${COLORS.navGray};

            font-family:
              "Poppins",
              Arial,
              sans-serif;

            font-size:
              9px;

            font-weight:
              500;

            cursor:
              pointer;
          }


          .mobile-account-nav-button.active {
            background:
              ${COLORS.teal};

            border-color:
              ${COLORS.teal};

            color:
              #FFFFFF;
          }


          .mobile-account-nav-button svg {
            width:
              14px;

            height:
              14px;
          }


          .account-content {
            gap:
              12px;
          }


          .account-card {
            padding:
              15px;

            border-radius:
              9px;
          }


          .account-card-header {
            margin-bottom:
              14px;
          }


          .account-card-title {
            font-size:
              22px;
          }


          .account-edit-button,
          .account-view-button {
            font-size:
              9px;
          }


          .profile-grid {
            grid-template-columns:
              1fr;

            gap:
              11px;
          }


          .profile-field.full {
            grid-column:
              auto;
          }


          .profile-label {
            font-size:
              9px;

            margin-bottom:
              5px;
          }


          .profile-input {
            height:
              39px;

            font-size:
              10px;

            padding:
              0 10px;
          }


          .profile-save-wrap {
            margin-top:
              12px;
          }


          .profile-save-button {
            width:
              100%;

            min-width:
              0;

            height:
              40px;

            font-size:
              10px;
          }


          .account-address-box {
            min-height:
              105px;

            gap:
              10px;

            padding:
              12px;
          }


          .address-icon {
            width:
              40px;

            height:
              40px;
          }


          .address-name {
            font-size:
              10px;
          }


          .address-line {
            font-size:
              9px;
          }


          .address-input-grid {
            grid-template-columns:
              1fr;
          }


          .address-input.full {
            grid-column:
              auto;
          }


          .address-save,
          .address-cancel {
            min-width:
              0;

            padding:
              0 13px;

            font-size:
              9px;
          }


          .address-edit-wrap {
            justify-content:
              flex-end;
          }


          /* ORDERS */

          .order-row {
            grid-template-columns:
              57px
              minmax(
                0,
                1fr
              )
              78px
              16px;

            gap:
              9px;

            min-height:
              67px;
          }


          .order-image {
            width:
              52px;

            height:
              50px;
          }


          .order-id {
            font-size:
              9px;
          }


          .order-meta {
            font-size:
              7.5px;
          }


          .order-status {
            min-width:
              61px;

            height:
              25px;

            padding:
              0 7px;

            font-size:
              7px;
          }


          .order-arrow svg {
            width:
              13px;

            height:
              13px;
          }


          .orders-tab-item {
            grid-template-columns:
              64px
              minmax(
                0,
                1fr
              )
              72px;

            gap:
              10px;
          }


          .orders-tab-image {
            width:
              58px;

            height:
              52px;
          }


          .orders-tab-info strong {
            font-size:
              9px;
          }


          .orders-tab-info span {
            font-size:
              8px;
          }

        }


        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 380px) {

          .account-container {
            padding:
              0 16px;
          }


          .account-title {
            font-size:
              35px;
          }


          .account-subtitle {
            font-size:
              9px;
          }


          .account-card {
            padding:
              13px;
          }


          .account-card-title {
            font-size:
              20px;
          }


          .order-row {
            grid-template-columns:
              50px
              minmax(
                0,
                1fr
              )
              68px
              14px;

            gap:
              7px;
          }


          .order-image {
            width:
              46px;

            height:
              46px;
          }


          .order-status {
            min-width:
              55px;

            font-size:
              6.5px;
          }

        }


        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {

          .account-page * {
            transition:
              none !important;
          }

        }

      `}</style>


      <div className="account-container">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <header className="account-header">

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}>
            <div>
              <h1 className="account-title">
                My Account
              </h1>

              <p className="account-subtitle">
                Manage your personal information,
                orders and addresses.
              </p>
            </div>

            {activeTab !== "orders" && (
              <Link
                href="/account/orders"
                className="account-view-all"
              >
                View All Orders
                <ArrowRight size={14} />
              </Link>
            )}
          </div>

        </header>


        {/* =================================================
            MOBILE NAV
        ================================================= */}

        <nav
          className="mobile-account-nav"
          aria-label="Account navigation"
        >

          <button
            type="button"
            className={
              `mobile-account-nav-button ${
                activeTab === "profile"
                  ? "active"
                  : ""
              }`
            }
            onClick={() =>
              setActiveTab("profile")
            }
          >
            <UserRound />
            Profile
          </button>


          <button
            type="button"
            className={
              `mobile-account-nav-button ${
                activeTab === "orders"
                  ? "active"
                  : ""
              }`
            }
            onClick={() =>
              router.push("/account/orders")
            }
          >
            <Package />
            My Orders
          </button>


          <button
            type="button"
            className={
              `mobile-account-nav-button ${
                activeTab === "addresses"
                  ? "active"
                  : ""
              }`
            }
            onClick={() =>
              setActiveTab(
                "addresses"
              )
            }
          >
            <MapPin />
            Addresses
          </button>


          <button
            type="button"
            className="mobile-account-nav-button"
            onClick={handleLogout}
          >
            <LogOut />
            Logout
          </button>

        </nav>


        {/* =================================================
            MAIN LAYOUT
        ================================================= */}

        <div className="account-layout">

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="account-sidebar">

            <button
              type="button"
              className={
                `account-nav-button ${
                  activeTab === "profile"
                    ? "active"
                    : ""
                }`
              }
              onClick={() =>
                setActiveTab("profile")
              }
            >

              <UserRound
                className="account-nav-icon"
              />

              <span>
                Profile
              </span>

            </button>


            <button
              type="button"
              className={
                `account-nav-button ${
                  activeTab === "orders"
                    ? "active"
                    : ""
                }`
              }
              onClick={() =>
                router.push("/account/orders")
              }
            >

              <Package
                className="account-nav-icon"
              />

              <span>
                My Orders
              </span>

            </button>


            <button
              type="button"
              className={
                `account-nav-button ${
                  activeTab === "addresses"
                    ? "active"
                    : ""
                }`
              }
              onClick={() =>
                setActiveTab(
                  "addresses"
                )
              }
            >

              <MapPin
                className="account-nav-icon"
              />

              <span>
                Addresses
              </span>

            </button>


            <button
              type="button"
              className="account-nav-button"
              onClick={handleLogout}
            >

              <LogOut
                className="account-nav-icon"
              />

              <span>
                Logout
              </span>

            </button>

          </aside>


          {/* =================================================
              CONTENT
          ================================================= */}

          <section className="account-content">

            {/* =================================================
                PROFILE
            ================================================= */}

            {activeTab ===
              "profile" && (
              <>

                <section className="account-card">

                  <div className="account-card-header">

                    <h2 className="account-card-title">
                      Profile Information
                    </h2>

                    <button
                      type="button"
                      className="account-edit-button"
                      onClick={() => {
                        setEditProfile(
                          (current) =>
                            !current
                        );

                        setProfileErrors({});
                      }}
                    >
                      <Pencil size={15} />

                      {editProfile
                        ? "Cancel"
                        : "Edit"}
                    </button>

                  </div>


                  <div className="profile-grid">

                    {/* FIRST NAME */}

                    <div className="profile-field">

                      <label className="profile-label">
                        First Name
                      </label>

                      <input
                        type="text"
                        value={
                          profile.firstName
                        }
                        readOnly={
                          !editProfile
                        }
                        className={
                          `profile-input ${
                            !editProfile
                              ? "readonly"
                              : ""
                          }`
                        }
                        onChange={(event) =>
                          updateProfile(
                            "firstName",
                            event.target
                              .value
                          )
                        }
                      />

                      {profileErrors.firstName && (
                        <span className="profile-error">
                          {
                            profileErrors.firstName
                          }
                        </span>
                      )}

                    </div>


                    {/* LAST NAME */}

                    <div className="profile-field">

                      <label className="profile-label">
                        Last Name
                      </label>

                      <input
                        type="text"
                        value={
                          profile.lastName
                        }
                        readOnly={
                          !editProfile
                        }
                        className={
                          `profile-input ${
                            !editProfile
                              ? "readonly"
                              : ""
                          }`
                        }
                        onChange={(event) =>
                          updateProfile(
                            "lastName",
                            event.target
                              .value
                          )
                        }
                      />

                      {profileErrors.lastName && (
                        <span className="profile-error">
                          {
                            profileErrors.lastName
                          }
                        </span>
                      )}

                    </div>


                    {/* EMAIL */}

                    <div className="profile-field full">

                      <label className="profile-label">
                        Email Address
                      </label>

                      <input
                        type="email"
                        value={
                          profile.email
                        }
                        readOnly={
                          !editProfile
                        }
                        className={
                          `profile-input ${
                            !editProfile
                              ? "readonly"
                              : ""
                          }`
                        }
                        onChange={(event) =>
                          updateProfile(
                            "email",
                            event.target
                              .value
                          )
                        }
                      />

                      {profileErrors.email && (
                        <span className="profile-error">
                          {
                            profileErrors.email
                          }
                        </span>
                      )}

                    </div>


                    {/* PHONE */}

                    <div className="profile-field full">

                      <label className="profile-label">
                        Phone Number
                      </label>

                      <input
                        type="tel"
                        value={
                          profile.phone
                        }
                        readOnly={
                          !editProfile
                        }
                        className={
                          `profile-input ${
                            !editProfile
                              ? "readonly"
                              : ""
                          }`
                        }
                        onChange={(event) =>
                          updateProfile(
                            "phone",
                            event.target
                              .value
                          )
                        }
                      />

                      {profileErrors.phone && (
                        <span className="profile-error">
                          {
                            profileErrors.phone
                          }
                        </span>
                      )}

                    </div>

                  </div>


                  {editProfile && (
                    <div className="profile-save-wrap">

                      <button
                        type="button"
                        className={
                          `profile-save-button ${
                            saved
                              ? "saved"
                              : ""
                          }`
                        }
                        onClick={
                          saveProfile
                        }
                      >

                        {saved ? (
                          <>
                            <Check
                              size={15}
                            />

                            Saved
                          </>
                        ) : (
                          <>
                            <Save
                              size={15}
                            />

                            Save Changes
                          </>
                        )}

                      </button>

                    </div>
                  )}

                </section>


                {/* =================================================
                    DEFAULT ADDRESS
                ================================================= */}

                <section className="account-card">

                  <div className="account-card-header">

                    <h2 className="account-card-title">
                      Default Address
                    </h2>

                    <button
                      type="button"
                      className="account-edit-button"
                      onClick={() => {
                        setEditAddress(
                          (current) =>
                            !current
                        );
                      }}
                    >

                      <Pencil size={15} />

                      {editAddress
                        ? "Cancel"
                        : "Edit"}

                    </button>

                  </div>


                  {editAddress ? (

                    <>

                      <div className="address-input-grid">

                        <input
                          className="address-input"
                          value={
                            address.name
                          }
                          onChange={(event) =>
                            updateAddress(
                              "name",
                              event.target
                                .value
                            )
                          }
                          placeholder="Full Name"
                        />

                        <input
                          className="address-input"
                          value={
                            address.phone
                          }
                          onChange={(event) =>
                            updateAddress(
                              "phone",
                              event.target
                                .value
                            )
                          }
                          placeholder="Phone Number"
                        />

                        <input
                          className="address-input full"
                          value={
                            address.line1
                          }
                          onChange={(event) =>
                            updateAddress(
                              "line1",
                              event.target
                                .value
                            )
                          }
                          placeholder="Address Line 1"
                        />

                        <input
                          className="address-input full"
                          value={
                            address.line2
                          }
                          onChange={(event) =>
                            updateAddress(
                              "line2",
                              event.target
                                .value
                            )
                          }
                          placeholder="Address Line 2"
                        />

                        <input
                          className="address-input full"
                          value={
                            address.line3
                          }
                          onChange={(event) =>
                            updateAddress(
                              "line3",
                              event.target
                                .value
                            )
                          }
                          placeholder="City / State / Country"
                        />

                      </div>


                      <div className="address-edit-wrap">

                        <button
                          type="button"
                          className="address-cancel"
                          onClick={() =>
                            setEditAddress(
                              false
                            )
                          }
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          className={
                            `address-save ${
                              addressSaved
                                ? "saved"
                                : ""
                            }`
                          }
                          onClick={
                            saveAddress
                          }
                        >

                          {addressSaved ? (
                            <>
                              <Check
                                size={13}
                              />
                              Saved
                            </>
                          ) : (
                            <>
                              <Save
                                size={13}
                              />
                              Save Address
                            </>
                          )}

                        </button>

                      </div>

                    </>

                  ) : (

                    <div className="account-address-box">

                      <div className="address-icon">
                        <MapPin
                          size={22}
                          strokeWidth={1.7}
                        />
                      </div>

                      <div className="address-info">

                        <span className="address-name">
                          {address.name}
                        </span>

                        <span className="address-line">
                          {address.line1}
                        </span>

                        <span className="address-line">
                          {address.line2}
                        </span>

                        <span className="address-line">
                          {address.line3}
                        </span>

                        <span className="address-line">
                          {address.phone}
                        </span>

                      </div>

                    </div>

                  )}

                </section>


                {/* =================================================
                    RECENT ORDERS
                ================================================= */}

                <section className="account-card">

                  <div className="account-card-header">

                    <h2 className="account-card-title">
                      My Orders
                    </h2>

                    <button
                      type="button"
                      className="account-view-button"
                      onClick={() =>
                        setActiveTab(
                          "orders"
                        )
                      }
                    >
                      View All

                      <ArrowRight
                        size={14}
                      />
                    </button>

                  </div>


                  <div className="orders-list">

                    {ordersLoading ? (
                      <p style={{ color: COLORS.navGray, fontSize: "12px" }}>
                        Loading orders...
                      </p>
                    ) : userOrders.length === 0 ? (
                      <p style={{ color: COLORS.navGray, fontSize: "12px" }}>
                        No orders yet.
                      </p>
                    ) : (
                      userOrders.map(
                        (order) => {
                          const canCancel =
                            order.status === "confirmed" ||
                            order.status === "pending";

                          return (
                            <div
                              key={order._id}
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "68px minmax(150px, 1fr) 110px " +
                                  (canCancel
                                    ? "80px "
                                    : "") +
                                  "22px",
                                alignItems: "center",
                                gap: "14px",
                                borderTop:
                                  "1px solid #ECE6DF",
                                minHeight: "73px",
                                paddingTop: "14px",
                                paddingBottom: "14px",
                              }}
                            >
                              <div className="order-image">
                                <img
                                  src={
                                    order.items?.[0]
                                      ?.productId
                                      ?.images?.[0] ||
                                    "/images/home/products/1.png"
                                  }
                                  alt="Order item"
                                />
                              </div>

                              <Link
                                href={`/account/orders/${order._id}`}
                                className="order-clickable"
                                style={{
                                  textDecoration:
                                    "none",
                                  display:
                                    "flex",
                                  flexDirection:
                                    "column",
                                  gap: "2px",
                                }}
                              >
                                <span className="order-id">
                                  Order #
                                  {order.orderNumber}
                                </span>

                                <span className="order-meta">
                                  {order.items?.length}{" "}
                                  {order.items?.length ===
                                  1
                                    ? "item"
                                    : "items"}{" "}
                                  • <StorefrontPrice amount={order.pricing?.total} />
                                </span>

                                <span className="order-meta">
                                  {new Date(
                                    order.createdAt
                                  ).toLocaleDateString(
                                    "en-IN"
                                  )}
                                </span>
                              </Link>

                              <span
                                className={
                                  `order-status ${
                                    order.status
                                      .toLowerCase()
                                      .replace(
                                        / /g,
                                        "-"
                                      )
                                  }`
                                }
                              >
                                {order.status}
                              </span>

                              {canCancel && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedOrderForCancel(
                                      order
                                    );
                                    setShowCancelModal(
                                      true
                                    );
                                  }}
                                  style={{
                                    border:
                                      "1px solid #A64C40",
                                    borderRadius:
                                      "4px",
                                    background:
                                      "transparent",
                                    color:
                                      "#A64C40",
                                    padding:
                                      "4px 8px",
                                    fontSize:
                                      "9px",
                                    fontWeight:
                                      "600",
                                    cursor:
                                      "pointer",
                                    whiteSpace:
                                      "nowrap",
                                    fontFamily:
                                      '"Poppins", Arial, sans-serif',
                                  }}
                                >
                                  Cancel
                                </button>
                              )}

                              <Link
                                href={`/account/orders/${order._id}`}
                                className="order-clickable"
                                style={{
                                  textDecoration:
                                    "none",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  color:
                                    COLORS.teal,
                                }}
                              >
                                <ChevronRight
                                  size={15}
                                />
                              </Link>
                            </div>
                          );
                        }
                      )
                    )}

                  </div>

                </section>

              </>
            )}


            {/* =================================================
                ORDERS TAB
            ================================================= */}

            {activeTab ===
              "orders" && (

              <section className="account-card">

                <div className="account-card-header">

                  <h2 className="account-card-title">
                    My Orders
                  </h2>

                  <span
                    className="account-view-button"
                  >
                    {userOrders.length} Orders
                  </span>

                </div>


                <div className="orders-tab-list">

                  {ordersLoading ? (
                    <p style={{ color: COLORS.navGray, fontSize: "12px" }}>
                      Loading orders...
                    </p>
                  ) : userOrders.length === 0 ? (
                    <p style={{ color: COLORS.navGray, fontSize: "12px" }}>
                      No orders found.
                    </p>
                  ) : (
                    userOrders.map(
                      (order) => {
                        const canCancel =
                          order.status === "confirmed" ||
                          order.status === "pending";

                        return (
                          <div
                            key={order._id}
                            style={{
                              width: "100%",
                              display: "grid",
                              gridTemplateColumns:
                                "80px minmax(0, 1fr) 100px" +
                                (canCancel
                                  ? " 80px"
                                  : ""),
                              alignItems: "center",
                              gap: "15px",
                              minHeight: "86px",
                              borderBottom:
                                "1px solid #ECE6DF",
                              paddingTop: "12px",
                              paddingBottom: "12px",
                            }}
                          >
                            <div className="orders-tab-image">
                              <img
                                src={
                                  order.items?.[0]
                                    ?.productId
                                    ?.images?.[0] ||
                                  "/images/home/products/1.png"
                                }
                                alt="Order item"
                              />
                            </div>

                            <Link
                              href={`/account/orders/${order._id}`}
                              className="order-clickable"
                              style={{
                                textDecoration:
                                  "none",
                                display:
                                  "flex",
                                flexDirection:
                                  "column",
                                gap: "4px",
                              }}
                            >
                              <strong
                                style={{
                                  display:
                                    "block",
                                  color:
                                    "#233A41",
                                  fontFamily:
                                    '"Poppins", Arial, sans-serif',
                                  fontSize:
                                    "12px",
                                  marginBottom:
                                    "3px",
                                }}
                              >
                                Order #
                                {
                                  order.orderNumber
                                }
                              </strong>

                              <span
                                style={{
                                  display:
                                    "block",
                                  color:
                                    COLORS.navGray,
                                  fontFamily:
                                    '"Poppins", Arial, sans-serif',
                                  fontSize:
                                    "10px",
                                  lineHeight:
                                    "1.5",
                                }}
                              >
                                {order.items?.length}{" "}
                                {order.items?.length ===
                                1
                                  ? "item"
                                  : "items"}{" "}
                                • <StorefrontPrice amount={order.pricing?.total} />
                              </span>

                              <span
                                style={{
                                  display:
                                    "block",
                                  color:
                                    COLORS.navGray,
                                  fontFamily:
                                    '"Poppins", Arial, sans-serif',
                                  fontSize:
                                    "10px",
                                  lineHeight:
                                    "1.5",
                                }}
                              >
                                {new Date(
                                  order.createdAt
                                ).toLocaleDateString(
                                  "en-IN"
                                )}
                              </span>
                            </Link>

                            <span
                              className={
                                `order-status ${
                                  order.status
                                    .toLowerCase()
                                    .replace(
                                      / /g,
                                      "-"
                                    )
                                }`
                              }
                            >
                              {order.status}
                            </span>

                            {canCancel && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedOrderForCancel(
                                    order
                                  );
                                  setShowCancelModal(
                                    true
                                  );
                                }}
                                style={{
                                  border:
                                    "1px solid #A64C40",
                                  borderRadius:
                                    "4px",
                                  background:
                                    "transparent",
                                  color:
                                    "#A64C40",
                                  padding:
                                    "4px 8px",
                                  fontSize:
                                    "9px",
                                  fontWeight:
                                    "600",
                                  cursor:
                                    "pointer",
                                  whiteSpace:
                                    "nowrap",
                                  fontFamily:
                                    '"Poppins", Arial, sans-serif',
                                }}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        );
                      }
                    )
                  )}

                </div>

              </section>

            )}


            {/* =================================================
                ADDRESSES TAB
            ================================================= */}

            {activeTab ===
              "addresses" && (

              <section
                id="account-addresses"
                className="account-card"
              >

                <div className="account-card-header">

                  <h2 className="account-card-title">
                    My Addresses
                  </h2>

                  <button
                    type="button"
                    className="account-edit-button"
                    onClick={() =>
                      setEditAddress(
                        (current) =>
                          !current
                      )
                    }
                  >
                    <Pencil size={15} />

                    {editAddress
                      ? "Cancel"
                      : "Edit"}
                  </button>

                </div>


                {editAddress ? (

                  <>
                    <div className="address-input-grid">

                      <input
                        className="address-input"
                        value={
                          address.name
                        }
                        onChange={(
                          event
                        ) =>
                          updateAddress(
                            "name",
                            event.target
                              .value
                          )
                        }
                        placeholder="Full Name"
                      />

                      <input
                        className="address-input"
                        value={
                          address.phone
                        }
                        onChange={(
                          event
                        ) =>
                          updateAddress(
                            "phone",
                            event.target
                              .value
                          )
                        }
                        placeholder="Phone"
                      />

                      <input
                        className="address-input full"
                        value={
                          address.line1
                        }
                        onChange={(
                          event
                        ) =>
                          updateAddress(
                            "line1",
                            event.target
                              .value
                          )
                        }
                        placeholder="Address"
                      />

                      <input
                        className="address-input full"
                        value={
                          address.line2
                        }
                        onChange={(
                          event
                        ) =>
                          updateAddress(
                            "line2",
                            event.target
                              .value
                          )
                        }
                        placeholder="City"
                      />

                      <input
                        className="address-input full"
                        value={
                          address.line3
                        }
                        onChange={(
                          event
                        ) =>
                          updateAddress(
                            "line3",
                            event.target
                              .value
                          )
                        }
                        placeholder="State / Country"
                      />

                    </div>

                    <div className="address-edit-wrap">

                      <button
                        type="button"
                        className="address-cancel"
                        onClick={() =>
                          setEditAddress(
                            false
                          )
                        }
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        className={
                          `address-save ${
                            addressSaved
                              ? "saved"
                              : ""
                          }`
                        }
                        onClick={
                          saveAddress
                        }
                      >

                        {addressSaved ? (
                          <>
                            <Check
                              size={13}
                            />
                            Saved
                          </>
                        ) : (
                          <>
                            <Save
                              size={13}
                            />
                            Save Address
                          </>
                        )}

                      </button>

                    </div>
                  </>

                ) : (

                  <div className="account-address-box">

                    <div className="address-icon">

                      <MapPin
                        size={22}
                        strokeWidth={1.7}
                      />

                    </div>

                    <div className="address-info">

                      <span className="address-name">
                        {address.name}
                      </span>

                      <span className="address-line">
                        {address.line1}
                      </span>

                      <span className="address-line">
                        {address.line2}
                      </span>

                      <span className="address-line">
                        {address.line3}
                      </span>

                      <span className="address-line">
                        {address.phone}
                      </span>

                    </div>

                  </div>

                )}

              </section>

            )}

          </section>

        </div>

      </div>

      {/* =====================================================
          CANCEL ORDER MODAL
      ===================================================== */}

      {showCancelModal && (
        <div className="cancel-modal-overlay">
          <div className="cancel-modal">
            <div className="cancel-modal-header">
              <h3 className="cancel-modal-title">
                Cancel Order
              </h3>
              <button
                type="button"
                className="cancel-modal-close"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                  setSelectedOrderForCancel(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="cancel-modal-body">
              <p style={{
                color: COLORS.navGray,
                fontFamily: '"Poppins", Arial, sans-serif',
                fontSize: "12px",
                marginBottom: "12px",
                margin: "0 0 12px 0",
              }}>
                Order #{selectedOrderForCancel?.orderNumber}
              </p>

              <label className="cancel-modal-label">
                Reason for cancellation (optional)
              </label>

              <textarea
                className="cancel-modal-textarea"
                value={cancelReason}
                onChange={(e) =>
                  setCancelReason(e.target.value)
                }
                placeholder="Tell us why you want to cancel this order..."
              />
            </div>

            <div className="cancel-modal-footer">
              <button
                type="button"
                className="cancel-modal-button cancel"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                  setSelectedOrderForCancel(null);
                }}
                disabled={cancelProcessing}
              >
                Back
              </button>

              <button
                type="button"
                className="cancel-modal-button confirm"
                onClick={handleCancelOrder}
                disabled={cancelProcessing}
              >
                {cancelProcessing
                  ? "Processing..."
                  : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}