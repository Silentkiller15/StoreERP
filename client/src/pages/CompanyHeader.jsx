import { useEffect, useState } from "react";
import axios from "axios";

export default function CompanyHeader({
  print = false,
}) {
  const [company, setCompany] =
    useState(null);

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      const res = await axios.get(
        "https://mudhikhana.onrender.com/company"
      );

      setCompany(res.data || {});
    } catch (err) {
      console.log(
        "Company Header Error:",
        err
      );

      setCompany({});
    }
  };

  if (!company) {
    return null;
  }

  return (
    <div
      className="company-header"
      style={{
        textAlign: "center",
        borderBottom:
          "2px solid #111827",
        paddingBottom: 12,
        marginBottom: 15,
      }}
    >
      {company.logo && (
        <img
          src={company.logo}
          alt="Company Logo"
          style={{
            maxWidth: 90,
            maxHeight: 70,
            objectFit: "contain",
            marginBottom: 5,
          }}
        />
      )}

      <h1
        style={{
          margin: 0,
          fontSize: print
            ? 22
            : 28,
          fontWeight: 700,
        }}
      >
        {company.name ||
          "Company Name"}
      </h1>

      {company.address && (
        <div
          style={{
            marginTop: 5,
            fontSize: 11,
            color: "#475569",
            whiteSpace:
              "pre-line",
          }}
        >
          {company.address}
        </div>
      )}

      {(company.phone ||
        company.email) && (
        <div
          style={{
            marginTop: 4,
            fontSize: 10,
            color: "#475569",
          }}
        >
          {company.phone &&
            `Phone: ${company.phone}`}

          {company.phone &&
            company.email &&
            "  |  "}

          {company.email &&
            `Email: ${company.email}`}
        </div>
      )}

      {company.gstin && (
        <div
          style={{
            marginTop: 4,
            fontSize: 10,
            fontWeight: 600,
            color: "#334155",
          }}
        >
          GSTIN: {company.gstin}
        </div>
      )}
    </div>
  );
}