import { useEffect, useState } from "react";
import axios from "axios";

import Sidebar from "../components/Sidebar";

export default function MainLayout({
  children,
  page,
  setPage,
  setEditingSaleId,
  setEditingPurchaseId,
  setInvoiceSaleId,

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  currentUser,
  onLogout,
}) {
  const [companyName, setCompanyName] =
    useState("Your Company");

  // ==================================================
  // LOAD COMPANY NAME
  // ==================================================

  const loadCompanyName = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/company"
      );

      if (res.data?.name) {
        setCompanyName(
          res.data.name
        );
      } else {
        setCompanyName(
          "Your Company"
        );
      }
    } catch (err) {
      console.log(
        "Company Name Load Error:",
        err
      );

      setCompanyName(
        "Your Company"
      );
    }
  };

  // ==================================================
  // LOAD WHEN LAYOUT OPENS
  // ==================================================

  useEffect(() => {
    loadCompanyName();
  }, []);

  // ==================================================
  // REFRESH COMPANY NAME WHEN COMPANY PAGE IS OPENED
  // ==================================================

  useEffect(() => {
    if (page === "company") {
      loadCompanyName();
    }
  }, [page]);

  // ==================================================
  // UI
  // ==================================================

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <Sidebar
        page={page}
        setPage={setPage}

        setEditingSaleId={
          setEditingSaleId
        }

        setEditingPurchaseId={
          setEditingPurchaseId
        }

        setInvoiceSaleId={
          setInvoiceSaleId
        }

        companyName={
          companyName
        }

        // ==========================================
        // AUTHENTICATION
        // ==========================================

        currentUser={
          currentUser
        }

        onLogout={
          onLogout
        }
      />

      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <div
        style={{
          flex: 1,
          padding: "30px",
          background: "#f5f5f5",
          minWidth: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}