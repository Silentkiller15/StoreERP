import { useEffect, useState } from "react";
import axios from "axios";

export default function Company() {
  const [company, setCompany] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    gstin: "",
    logo: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ==================================================
  // LOAD COMPANY
  // ==================================================

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/company"
      );

      if (res.data) {
        setCompany({
          name: res.data.name || "",
          address: res.data.address || "",
          phone: res.data.phone || "",
          email: res.data.email || "",
          gstin: res.data.gstin || "",
          logo: res.data.logo || "",
        });
      }
    } catch (err) {
      console.log("Load Company Error:", err);
      alert("Unable to load company details");
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // HANDLE TEXT CHANGE
  // ==================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCompany((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==================================================
  // LOGO FILE CHANGE
  // ==================================================

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Allow only image files
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      e.target.value = "";
      return;
    }

    // Limit logo size to 2 MB
    if (file.size > 2 * 1024 * 1024) {
      alert(
        "Logo file is too large. Please select an image smaller than 2 MB."
      );
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setCompany((prev) => ({
        ...prev,
        logo: reader.result,
      }));
    };

    reader.onerror = () => {
      alert("Unable to read the selected logo.");
    };

    reader.readAsDataURL(file);
  };

  // ==================================================
  // REMOVE LOGO
  // ==================================================

  const removeLogo = () => {
    setCompany((prev) => ({
      ...prev,
      logo: "",
    }));
  };

  // ==================================================
  // SAVE COMPANY
  // ==================================================

  const saveCompany = async () => {
    if (!company.name.trim()) {
      alert("Please enter Company Name");
      return;
    }

    try {
      setSaving(true);

      await axios.post(
        "http://localhost:5000/company",
        company
      );

      alert(
        "Company Details Saved Successfully"
      );
    } catch (err) {
      console.log("Save Company Error:", err);

      alert(
        err.response?.data?.message ||
          "Unable to save company details"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // CLEAR FORM
  // ==================================================

  const clearForm = () => {
    setCompany({
      name: "",
      address: "",
      phone: "",
      email: "",
      gstin: "",
      logo: "",
    });
  };

  // ==================================================
  // STYLES
  // ==================================================

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    boxShadow:
      "0 2px 10px rgba(15,23,42,0.06)",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "7px",
    color: "#334155",
    fontSize: "12px",
    fontWeight: "800",
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 13px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#0f172a",
    outline: "none",
    fontSize: "13px",
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f1f5f9",
          padding: "24px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            ...cardStyle,
            padding: "60px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "40px",
              marginBottom: "10px",
            }}
          >
            ⏳
          </div>

          <div
            style={{
              color: "#334155",
              fontWeight: "800",
            }}
          >
            Loading Company Settings...
          </div>
        </div>
      </div>
    );
  }

  // ==================================================
  // MAIN UI
  // ==================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
        background: "#f1f5f9",
        boxSizing: "border-box",
      }}
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        style={{
          ...cardStyle,
          padding: "20px 24px",
          marginBottom: "18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: "#64748b",
              fontSize: "11px",
              fontWeight: "800",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Business Configuration
          </div>

          <h1
            style={{
              margin: "4px 0 5px",
              color: "#0f172a",
              fontSize: "26px",
            }}
          >
            🏢 Company Settings
          </h1>

          <div
            style={{
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Manage your company information used
            throughout the ERP system.
          </div>
        </div>

        <div
          style={{
            padding: "8px 12px",
            background: "#eff6ff",
            color: "#1d4ed8",
            border: "1px solid #bfdbfe",
            borderRadius: "8px",
            fontSize: "11px",
            fontWeight: "900",
          }}
        >
          COMPANY PROFILE
        </div>
      </div>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1.6fr) minmax(280px, 0.8fr)",
          gap: "18px",
          alignItems: "start",
        }}
      >
        {/* ==================================================
            LEFT FORM
        ================================================== */}

        <div
          style={{
            ...cardStyle,
            padding: "24px",
          }}
        >
          <div
            style={{
              marginBottom: "22px",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#0f172a",
                fontSize: "18px",
              }}
            >
              Company Information
            </h2>

            <div
              style={{
                marginTop: "4px",
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              Enter your company details below.
            </div>
          </div>

          {/* COMPANY NAME */}

          <div
            style={{
              marginBottom: "18px",
            }}
          >
            <label style={labelStyle}>
              Company Name *
            </label>

            <input
              type="text"
              name="name"
              placeholder="Enter company name"
              value={company.name}
              onChange={handleChange}
              style={{
                ...inputStyle,
                fontSize: "15px",
                fontWeight: "700",
              }}
            />
          </div>

          {/* ADDRESS */}

          <div
            style={{
              marginBottom: "18px",
            }}
          >
            <label style={labelStyle}>
              Business Address
            </label>

            <textarea
              name="address"
              rows="4"
              placeholder="Enter complete business address"
              value={company.address}
              onChange={handleChange}
              style={{
                ...inputStyle,
                resize: "vertical",
                lineHeight: "1.5",
              }}
            />
          </div>

          {/* PHONE + EMAIL */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
              marginBottom: "18px",
            }}
          >
            <div>
              <label style={labelStyle}>
                Phone Number
              </label>

              <input
                type="text"
                name="phone"
                placeholder="Enter phone number"
                value={company.phone}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Email Address
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter email address"
                value={company.email}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          </div>

          {/* GSTIN */}

          <div
            style={{
              marginBottom: "18px",
            }}
          >
            <label style={labelStyle}>
              GSTIN
            </label>

            <input
              type="text"
              name="gstin"
              placeholder="Enter GSTIN"
              value={company.gstin}
              onChange={handleChange}
              style={{
                ...inputStyle,
                textTransform: "uppercase",
                fontWeight: "700",
              }}
            />
          </div>

          {/* ==================================================
              LOGO UPLOAD
          ================================================== */}

          <div
            style={{
              marginBottom: "22px",
            }}
          >
            <label style={labelStyle}>
              Company Logo
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "120px minmax(0, 1fr)",
                gap: "15px",
                alignItems: "center",
                padding: "15px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
              }}
            >
              {/* LOGO PREVIEW */}

              <div
                style={{
                  width: "110px",
                  height: "90px",
                  border: "1px dashed #cbd5e1",
                  borderRadius: "9px",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt="Company Logo"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#94a3b8",
                      fontSize: "11px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "28px",
                        marginBottom: "4px",
                      }}
                    >
                      🏢
                    </div>

                    No Logo
                  </div>
                )}
              </div>

              {/* UPLOAD AREA */}

              <div>
                <input
                  id="company-logo"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleLogoChange}
                  style={{
                    display: "none",
                  }}
                />

                <label
                  htmlFor="company-logo"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    background: "#2563eb",
                    color: "#ffffff",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "800",
                  }}
                >
                  📁 Browse Logo
                </label>

                {company.logo && (
                  <button
                    type="button"
                    onClick={removeLogo}
                    style={{
                      marginLeft: "8px",
                      padding: "10px 14px",
                      background: "#fee2e2",
                      color: "#b91c1c",
                      border:
                        "1px solid #fecaca",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "800",
                    }}
                  >
                    🗑 Remove
                  </button>
                )}

                <div
                  style={{
                    marginTop: "9px",
                    color: "#64748b",
                    fontSize: "10px",
                    lineHeight: "1.5",
                  }}
                >
                  Select PNG, JPG, JPEG or WEBP.
                  <br />
                  Maximum file size: 2 MB.
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              BUTTONS
          ================================================== */}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              paddingTop: "18px",
              borderTop:
                "1px solid #e2e8f0",
            }}
          >
            <button
              type="button"
              onClick={clearForm}
              style={{
                padding: "11px 20px",
                background: "#f1f5f9",
                color: "#475569",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "800",
                fontSize: "13px",
              }}
            >
              Clear
            </button>

            <button
              type="button"
              onClick={saveCompany}
              disabled={saving}
              style={{
                padding: "11px 24px",
                background: saving
                  ? "#94a3b8"
                  : "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                cursor: saving
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "900",
                fontSize: "13px",
              }}
            >
              {saving
                ? "⏳ Saving..."
                : "💾 Save Company"}
            </button>
          </div>
        </div>

        {/* ==================================================
            RIGHT SIDE
        ================================================== */}

        <div
          style={{
            display: "grid",
            gap: "16px",
          }}
        >
          {/* COMPANY PREVIEW */}

          <div
            style={{
              ...cardStyle,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "15px 18px",
                background: "#0f172a",
                color: "#ffffff",
                fontWeight: "900",
                fontSize: "13px",
              }}
            >
              👁 Company Preview
            </div>

            <div
              style={{
                padding: "22px",
                textAlign: "center",
              }}
            >
              {/* LOGO */}

              {company.logo ? (
                <div
                  style={{
                    width: "90px",
                    height: "90px",
                    margin:
                      "0 auto 13px",
                    borderRadius: "12px",
                    border:
                      "1px solid #e2e8f0",
                    background: "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={company.logo}
                    alt="Company Logo"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: "90px",
                    height: "90px",
                    margin:
                      "0 auto 13px",
                    borderRadius: "12px",
                    background: "#eff6ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "36px",
                    fontWeight: "900",
                  }}
                >
                  🏢
                </div>
              )}

              {/* COMPANY NAME */}

              <div
                style={{
                  color: "#0f172a",
                  fontSize: "19px",
                  fontWeight: "900",
                  wordBreak: "break-word",
                }}
              >
                {company.name ||
                  "Your Company Name"}
              </div>

              {/* ADDRESS */}

              {company.address && (
                <div
                  style={{
                    marginTop: "8px",
                    color: "#64748b",
                    fontSize: "12px",
                    lineHeight: "1.5",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {company.address}
                </div>
              )}

              {/* CONTACT */}

              <div
                style={{
                  marginTop: "15px",
                  paddingTop: "13px",
                  borderTop:
                    "1px solid #e2e8f0",
                  display: "grid",
                  gap: "6px",
                  color: "#475569",
                  fontSize: "11px",
                }}
              >
                {company.phone && (
                  <div>
                    📞 {company.phone}
                  </div>
                )}

                {company.email && (
                  <div
                    style={{
                      wordBreak:
                        "break-word",
                    }}
                  >
                    ✉️ {company.email}
                  </div>
                )}

                {company.gstin && (
                  <div>
                    🧾 GSTIN:{" "}
                    {company.gstin}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PRINT INFO */}

          <div
            style={{
              ...cardStyle,
              padding: "20px",
              background: "#eff6ff",
              border:
                "1px solid #bfdbfe",
            }}
          >
            <div
              style={{
                color: "#1e3a8a",
                fontSize: "14px",
                fontWeight: "900",
              }}
            >
              🖨️ Printing
            </div>

            <div
              style={{
                marginTop: "7px",
                color: "#475569",
                fontSize: "11px",
                lineHeight: "1.6",
              }}
            >
              The selected company logo is saved
              together with your company details
              and can be used by your invoice,
              ledger and report printing.
            </div>
          </div>

          {/* STATUS */}

          <div
            style={{
              ...cardStyle,
              padding: "18px",
              background: "#f8fafc",
            }}
          >
            <div
              style={{
                color: "#334155",
                fontSize: "13px",
                fontWeight: "900",
              }}
            >
              💡 Company Profile
            </div>

            <div
              style={{
                marginTop: "8px",
                display: "grid",
                gap: "8px",
              }}
            >
              <StatusRow
                label="Company Name"
                value={company.name}
              />

              <StatusRow
                label="GSTIN"
                value={company.gstin}
              />

              <StatusRow
                label="Logo"
                value={company.logo}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================================================
// STATUS ROW
// ==================================================

function StatusRow({
  label,
  value,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems: "center",
        gap: "10px",
        fontSize: "11px",
      }}
    >
      <span
        style={{
          color: "#64748b",
        }}
      >
        {label}
      </span>

      <b
        style={{
          color: value
            ? "#15803d"
            : "#94a3b8",
        }}
      >
        {value
          ? "✓ Set"
          : "Not Set"}
      </b>
    </div>
  );
}